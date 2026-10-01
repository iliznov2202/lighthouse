import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { validateEnvironment } from './config/environment';
import { ApiExceptionFilter } from './common/api-exception.filter';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SchoolsModule } from './schools/schools.module';
import { ClassesModule } from './classes/classes.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }), ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 120 }]), PrismaModule, AuthModule, UsersModule, SchoolsModule, ClassesModule],
  providers: [{ provide: APP_FILTER, useClass: ApiExceptionFilter }, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
