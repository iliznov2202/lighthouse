import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

export const publicUserSelect = {
  id: true, email: true, name: true, schoolId: true, classId: true, createdAt: true,
  school: { select: { id: true, name: true, city: true } },
  schoolClass: { select: { id: true, name: true, schoolId: true } },
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async me(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: publicUserSelect });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
