import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional, Min, Max } from "class-validator";

export class AttendanceRequestDto {
  @ApiProperty({ description: "Student roll number", example: "21Z123" })
  @IsString()
  rollno: string;

  @ApiProperty({ description: "Student password", example: "password123" })
  @IsString()
  password: string;

  @ApiProperty({
    description: "Attendance threshold percentage",
    example: 75,
    required: false,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  threshold?: number;
}
