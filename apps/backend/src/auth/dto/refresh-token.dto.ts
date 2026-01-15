import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiPropertyOptional({ description: 'Refresh token (optional if using cookies)' })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}
