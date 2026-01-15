import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { TimetableService } from "./timetable.service";
import { Public } from "../auth/decorators/public.decorator";

@ApiTags("timetable")
@Controller("timetable")
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get exam timetable" })
  async getTimetable(@Body() body: { rollno: string; password: string }) {
    return this.timetableService.getTimetable(body.rollno, body.password);
  }
}
