import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AttendanceService } from "./attendance.service";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "../auth/auth.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Public } from "../auth/decorators/public.decorator";
import { AttendanceRequestDto } from "./dto/attendance-request.dto";
import { AuthenticatedAttendanceRequestDto } from "./dto/authenticated-attendance-request.dto";

@ApiTags("attendance")
@Controller("attendance")
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get attendance data" })
  @ApiResponse({ status: 200, description: "Attendance data retrieved" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async getAttendance(@Body() body: AttendanceRequestDto) {
    const { rollno, password, threshold = 75 } = body;
    const userId = `temp-${rollno}`;

    return this.attendanceService.getAttendance(
      userId,
      rollno,
      password,
      threshold,
    );
  }

  @Post("authenticated")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get attendance for authenticated user" })
  async getAuthenticatedAttendance(
    @CurrentUser() user: any,
    @Body() body: AuthenticatedAttendanceRequestDto,
  ) {
    const threshold = body.threshold || 75;

    const userWithCredentials = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        encryptedRollNo: true,
        encryptedPassword: true,
      },
    });

    if (
      !userWithCredentials?.encryptedRollNo ||
      !userWithCredentials?.encryptedPassword
    ) {
      throw new UnauthorizedException(
        "eCampus credentials not found. Please login again.",
      );
    }

    const credentials = this.authService.decryptCredentials(
      userWithCredentials.encryptedRollNo,
      userWithCredentials.encryptedPassword,
    );

    return this.attendanceService.getAttendance(
      user.id,
      credentials.rollno,
      credentials.password,
      threshold,
    );
  }
}
