import { Module } from "@nestjs/common";
import { FeedbackService } from "./feedback.service";
import { FeedbackController } from "./feedback.controller";
import { FeedbackScraper } from "../scrapers/feedback.scraper";

@Module({
  controllers: [FeedbackController],
  providers: [FeedbackService, FeedbackScraper],
  exports: [FeedbackService],
})
export class FeedbackModule {}
