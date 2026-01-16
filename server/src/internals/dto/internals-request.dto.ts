import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class InternalsRequestDto {
  @ApiProperty({ description: "Student roll number", example: "20PT01" })
  @IsString()
  rollno: string;

  @ApiProperty({ description: "Student password", example: "password123" })
  @IsString()
  password: string;
}
