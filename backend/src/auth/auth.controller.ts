import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, RegisterDto } from './auth.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Register and create a session' })
  register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(200)
  login(@Body() dto: LoginDto) { return this.auth.login(dto); }
  @Post('refresh')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @HttpCode(200)
  @ApiOperation({ summary: 'Rotate a refresh token (single use)' })
  refresh(@Body() dto: RefreshTokenDto) { return this.auth.refresh(dto.refreshToken); }
  @Post('logout')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @HttpCode(204)
  @ApiOperation({ summary: 'Revoke the session; repeat logout is safe' })
  logout(@Body() dto: RefreshTokenDto) { return this.auth.logout(dto.refreshToken); }
}
