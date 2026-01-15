import { Injectable } from "@nestjs/common";

@Injectable()
export class FeedbackService {
  // TODO: Implement feedback automation with Puppeteer
  async submitFeedback(
    rollno: string,
    _password: string,
    _feedbackIndex?: number,
  ) {
    return {
      message: "Feedback automation not implemented yet",
      rollno,
    };
  }
}
