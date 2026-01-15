import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, Min, Max } from "class-validator";

export class AuthenticatedAttendanceRequestDto {
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
