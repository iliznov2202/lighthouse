import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessGuard, type AuthRequest } from '../auth/auth.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AccessGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Get('me')
  me(@Req() request: AuthRequest) { return this.users.me(request.user.id); }
}
