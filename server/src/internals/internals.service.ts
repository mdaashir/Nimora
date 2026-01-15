import { Injectable, Logger } from "@nestjs/common";
import { InternalsScraperService } from "../scrapers/internals.scraper";
import type { InternalsResponse } from "../types";

@Injectable()
export class InternalsService {
  private readonly logger = new Logger(InternalsService.name);

  constructor(private readonly internalsScraper: InternalsScraperService) {}

  async getInternals(
    rollno: string,
    password: string,
  ): Promise<InternalsResponse> {
    this.logger.log(`Fetching internal marks for ${rollno}`);

    try {
      const internalsData = await this.internalsScraper.scrapeInternals(
        rollno,
        password,
      );
      this.logger.log(`Successfully fetched internals for ${rollno}`);
      return internalsData;
    } catch (error) {
      this.logger.error(`Failed to fetch internals for ${rollno}:`, error);
      throw error;
    }
  }
}
