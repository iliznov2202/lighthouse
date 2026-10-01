import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import type { Request } from 'express';

export type AuthRequest = Request & { user: { id: string; sessionId: string } };

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly prisma: PrismaService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const match = request.headers.authorization?.match(/^Bearer (\S+)$/i);
    if (!match) throw new UnauthorizedException('Access token required');
    let payload: { sub: string; sid: string; type: string };
    try {
      payload = await this.jwt.verifyAsync(match[1], { algorithms: ['HS256'], issuer: 'mayak', audience: 'mayak-api' });
      if (payload.type !== 'access' || typeof payload.sub !== 'string' || typeof payload.sid !== 'string') throw new Error();
    } catch { throw new UnauthorizedException('Invalid or expired access token'); }
    const session = await this.prisma.session.findFirst({ where: { id: payload.sid, userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() } } });
    if (!session) throw new UnauthorizedException('Session expired or revoked');
    request.user = { id: payload.sub, sessionId: payload.sid };
    return true;
  }
}
