import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccessGuard } from './auth.guard';

@Module({
  imports: [JwtModule.registerAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => ({ secret: config.getOrThrow<string>('JWT_ACCESS_SECRET') }) })],
  providers: [AuthService, AccessGuard], controllers: [AuthController], exports: [AccessGuard, JwtModule],
})
export class AuthModule {}
