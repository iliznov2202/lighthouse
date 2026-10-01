import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'student@mayak.test' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ minLength: 8, maxLength: 128, format: 'password' })
  @IsString()
  @Length(8, 128)
  password!: string;
}

export class RegisterDto extends LoginDto {
  @ApiProperty({ example: 'Анна', minLength: 1, maxLength: 100 })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(1, 100)
  name!: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Opaque refresh token returned by register/login/refresh', minLength: 64, maxLength: 64 })
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{64}$/)
  refreshToken!: string;
}
