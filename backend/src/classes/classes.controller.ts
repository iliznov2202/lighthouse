import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessGuard, type AuthRequest } from '../auth/auth.guard';
import { CreateClassDto } from './classes.dto';
import { ClassesService } from './classes.service';

@ApiTags('classes')
@ApiBearerAuth()
@UseGuards(AccessGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classes: ClassesService) {}
  @Post()
  create(@Req() request: AuthRequest, @Body() dto: CreateClassDto) { return this.classes.create(request.user.id, dto); }
  @Post(':classId/join')
  @HttpCode(200)
  join(@Req() request: AuthRequest, @Param('classId', new ParseUUIDPipe({ version: '4' })) id: string) { return this.classes.join(request.user.id, id); }
  @Get(':classId')
  get(@Req() request: AuthRequest, @Param('classId', new ParseUUIDPipe({ version: '4' })) id: string) { return this.classes.get(request.user.id, id); }
}
