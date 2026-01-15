import { Injectable } from "@nestjs/common";
import { FeedbackScraper, FeedbackResult } from "../scrapers/feedback.scraper";

@Injectable()
export class FeedbackService {
  constructor(private readonly feedbackScraper: FeedbackScraper) {}

  /**
   * Submit feedback automatically using the feedback scraper
   * @param rollno - Student roll number
   * @param password - Student password
   * @param feedbackIndex - Feedback type index (0 for end-sem, others for intermediate)
   * @returns Feedback submission result
   */
  async submitFeedback(
    rollno: string,
    password: string,
    feedbackIndex: number = 0,
  ): Promise<FeedbackResult> {
    return await this.feedbackScraper.autoFeedback(
      feedbackIndex,
      rollno,
      password,
    );
  }
}
