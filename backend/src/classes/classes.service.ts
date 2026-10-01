import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../users/users.service';
import { CreateClassDto } from './classes.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}
  async create(userId: string, dto: CreateClassDto) {
    return this.prisma.$transaction(async tx => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { schoolId: true } });
      if (user.schoolId && user.schoolId !== dto.schoolId) throw new ForbiddenException('You belong to another school');
      if (!await tx.school.findUnique({ where: { id: dto.schoolId }, select: { id: true } })) throw new NotFoundException('School not found');
      // Creation does not change membership; join is an explicit operation.
      const schoolClass = await tx.schoolClass.create({ data: { schoolId: dto.schoolId, name: dto.name }, select: { id: true, name: true, schoolId: true } });
      await this.audit.record(tx, { actorId: userId, action: 'CLASS_CREATED', resourceType: 'SchoolClass', resourceId: schoolClass.id });
      return schoolClass;
    });
  }
  async join(userId: string, classId: string) {
    return this.prisma.$transaction(async tx => {
      const schoolClass = await tx.schoolClass.findUnique({ where: { id: classId } });
      if (!schoolClass) throw new NotFoundException('Class not found');
      // Conditional update prevents two concurrent joins to different classes.
      const joined = await tx.user.updateMany({ where: { id: userId, classId: null, OR: [{ schoolId: null }, { schoolId: schoolClass.schoolId }] }, data: { schoolId: schoolClass.schoolId, classId } });
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: publicUserSelect });
      if (user.classId !== classId || user.schoolId !== schoolClass.schoolId) throw new ConflictException('You already belong to another school or class');
      if (joined.count === 1) await this.audit.record(tx, { actorId: userId, action: 'CLASS_JOINED', resourceType: 'SchoolClass', resourceId: classId });
      return user;
    });
  }
  async get(userId: string, id: string) {
    const schoolClass = await this.prisma.schoolClass.findUnique({ where: { id }, select: { id: true, name: true, schoolId: true, school: { select: { id: true, name: true, city: true } }, _count: { select: { users: true } } } });
    if (!schoolClass) throw new NotFoundException('Class not found');
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { schoolId: true } });
    if (user.schoolId && user.schoolId !== schoolClass.schoolId) throw new ForbiddenException('You belong to another school');
    // No student roster or private user data is exposed by class lookup.
    return schoolClass;
  }
}
