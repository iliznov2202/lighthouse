import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SchoolsService } from './schools.service';
import { SchoolQueryDto } from './schools.dto';

@ApiTags('schools')
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schools: SchoolsService) {}
  @Get()
  search(@Query() dto: SchoolQueryDto) { return this.schools.search(dto.query); }
  @Get(':schoolId/classes')
  classes(@Param('schoolId', new ParseUUIDPipe({ version: '4' })) id: string) { return this.schools.classes(id); }
}
