import { IsEmail, IsOptional, IsString, IsUrl } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ example: "20PT01@psgtech.ac.in" })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: "John Doe" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: "https://example.com/avatar.jpg" })
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;
}
