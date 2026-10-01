import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { AuditModule } from '../audit/audit.module';

@Module({ imports: [AuthModule, AuditModule], controllers: [ClassesController], providers: [ClassesService] })
export class ClassesModule {}
