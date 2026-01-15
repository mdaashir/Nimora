import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CgpaService } from "./cgpa.service";
import { Public } from "../auth/decorators/public.decorator";
import { CgpaRequestDto } from "./dto/cgpa-request.dto";

@ApiTags("cgpa")
@Controller("cgpa")
export class CgpaController {
  constructor(private readonly cgpaService: CgpaService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get CGPA data" })
  @ApiResponse({ status: 200, description: "CGPA data retrieved" })
  async getCgpa(@Body() body: CgpaRequestDto) {
    const { rollno, password } = body;
    const userId = `temp-${rollno}`;
    return this.cgpaService.getCgpa(userId, rollno, password);
  }
}
