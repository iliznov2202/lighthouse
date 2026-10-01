import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../users/users.service';
import { LoginDto, RegisterDto } from './auth.dto';
import type { Prisma } from '../generated/prisma/client';

export const hashRefreshToken = (token: string) => createHash('sha256').update(token).digest('hex');

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService, private readonly config: ConfigService) {}
  private refreshExpiry() { return new Date(Date.now() + this.config.getOrThrow<number>('REFRESH_TOKEN_TTL_DAYS') * 86400000); }
  private async tokens(userId: string, sessionId: string, refreshToken: string) {
    const expiresIn = this.config.getOrThrow<number>('ACCESS_TOKEN_TTL_SECONDS');
    const accessToken = await this.jwt.signAsync({ sub: userId, sid: sessionId, type: 'access' }, { expiresIn, algorithm: 'HS256', issuer: 'mayak', audience: 'mayak-api' });
    return { accessToken, refreshToken, tokenType: 'Bearer', expiresIn };
  }
  private async newSession(tx: Prisma.TransactionClient, userId: string) {
    const token = randomBytes(48).toString('base64url');
    const id = randomUUID();
    await tx.session.create({ data: { id, userId, refreshTokenHash: hashRefreshToken(token), expiresAt: this.refreshExpiry() } });
    return this.tokens(userId, id, token);
  }
  async register(dto: RegisterDto) {
    if (await this.prisma.user.findUnique({ where: { email: dto.email }, select: { id: true } })) throw new ConflictException('Email already registered');
    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    return this.prisma.$transaction(async tx => {
      const user = await tx.user.create({ data: { email: dto.email, name: dto.name, passwordHash }, select: publicUserSelect });
      return { user, ...await this.newSession(tx, user.id) };
    });
  }
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // Perform a password hash even for unknown emails to reduce account timing leakage.
    const valid = user ? await argon2.verify(user.passwordHash, dto.password) : (await argon2.hash(dto.password), false);
    if (!user || !valid) throw new UnauthorizedException('Invalid email or password');
    return this.prisma.$transaction(async tx => ({ user: await tx.user.findUniqueOrThrow({ where: { id: user.id }, select: publicUserSelect }), ...await this.newSession(tx, user.id) }));
  }
  async refresh(token: string) {
    const hash = hashRefreshToken(token);
    const nextToken = randomBytes(48).toString('base64url');
    return this.prisma.$transaction(async tx => {
      const session = await tx.session.findUnique({ where: { refreshTokenHash: hash } });
      if (!session || session.revokedAt || session.expiresAt <= new Date()) throw new UnauthorizedException('Invalid or expired refresh token');
      // Compare-and-swap: only one concurrent request can rotate the token.
      const updated = await tx.session.updateMany({ where: { id: session.id, refreshTokenHash: hash, revokedAt: null, expiresAt: { gt: new Date() } }, data: { refreshTokenHash: hashRefreshToken(nextToken) } });
      if (updated.count !== 1) throw new UnauthorizedException('Refresh token already used');
      return this.tokens(session.userId, session.id, nextToken);
    });
  }
  async logout(token: string) {
    await this.prisma.session.updateMany({ where: { refreshTokenHash: hashRefreshToken(token), revokedAt: null }, data: { revokedAt: new Date() } });
  }
}
