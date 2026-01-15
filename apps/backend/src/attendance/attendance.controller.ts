import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

class AttendanceRequestDto {
  rollno: string;
  password: string;
  threshold?: number;
}

@ApiTags('attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Public() // Allow without auth for now (direct credentials flow)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get attendance data' })
  @ApiResponse({ status: 200, description: 'Attendance data retrieved' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async getAttendance(@Body() body: AttendanceRequestDto) {
    const { rollno, password, threshold = 75 } = body;

    // For now, use a placeholder userId (will be from auth later)
    const userId = `temp-${rollno}`;

    return this.attendanceService.getAttendance(
      userId,
      rollno,
      password,
      threshold,
    );
  }

  @Post('authenticated')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get attendance for authenticated user' })
  async getAuthenticatedAttendance(
    @CurrentUser() user: any,
    @Body() body: { threshold?: number },
  ) {
    // This would use stored encrypted credentials
    // For now, placeholder
    return {
      message: 'Use stored credentials flow - not implemented yet',
      userId: user.id,
    };
  }
}
