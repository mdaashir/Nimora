import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional, Min } from "class-validator";

export class FeedbackRequestDto {
  @ApiProperty({ description: "Student roll number", example: "21Z123" })
  @IsString()
  rollno: string;

  @ApiProperty({ description: "Student password", example: "password123" })
  @IsString()
  password: string;

  @ApiProperty({
    description: "Feedback type index (0 for end-sem, others for intermediate)",
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  feedbackIndex?: number;
}
