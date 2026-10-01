import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchoolsService {
  constructor(private readonly prisma: PrismaService) {}
  search(query?: string) {
    return this.prisma.school.findMany({ where: query ? { OR: [{ name: { contains: query, mode: 'insensitive' } }, { city: { contains: query, mode: 'insensitive' } }] } : {}, select: { id: true, name: true, city: true }, orderBy: [{ name: 'asc' }, { id: 'asc' }], take: 50 });
  }
  async classes(schoolId: string) {
    if (!await this.prisma.school.findUnique({ where: { id: schoolId }, select: { id: true } })) throw new NotFoundException('School not found');
    return this.prisma.schoolClass.findMany({ where: { schoolId }, select: { id: true, name: true, schoolId: true, _count: { select: { users: true } } }, orderBy: { name: 'asc' } });
  }
}
