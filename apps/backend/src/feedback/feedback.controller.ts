import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit feedback automatically' })
  async submitFeedback(
    @Body() body: { rollno: string; password: string; feedbackIndex?: number },
  ) {
    return this.feedbackService.submitFeedback(
      body.rollno,
      body.password,
      body.feedbackIndex,
    );
  }
}
