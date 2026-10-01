import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsUUID, Matches } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  schoolId!: string;
  @ApiProperty({ example: '9Б', description: 'Grade 1–11 and one Cyrillic letter' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
  @IsString()
  @Matches(/^(?:[1-9]|1[01])[А-ЯЁ]$/u)
  name!: string;
}
