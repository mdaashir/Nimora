import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InternalsService } from './internals.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('internals')
@Controller('internals')
export class InternalsController {
  constructor(private readonly internalsService: InternalsService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get internal marks' })
  async getInternals(@Body() body: { rollno: string; password: string }) {
    return this.internalsService.getInternals(body.rollno, body.password);
  }
}
