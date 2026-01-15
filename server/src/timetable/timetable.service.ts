import { Injectable, Logger } from "@nestjs/common";
import { TimetableScraperService } from "../scrapers/timetable.scraper";
import type { ExamScheduleResponse, ClassTimetableResponse } from "../types";

@Injectable()
export class TimetableService {
  private readonly logger = new Logger(TimetableService.name);

  constructor(private readonly timetableScraper: TimetableScraperService) {}

  async getExamSchedule(
    rollno: string,
    password: string,
  ): Promise<ExamScheduleResponse> {
    this.logger.log(`Fetching exam schedule for ${rollno}`);
    return this.timetableScraper.scrapeExamSchedule(rollno, password);
  }

  async getClassTimetable(
    rollno: string,
    password: string,
  ): Promise<ClassTimetableResponse> {
    this.logger.log(`Fetching class timetable for ${rollno}`);
    return this.timetableScraper.scrapeClassTimetable(rollno, password);
  }

  async getTimetable(rollno: string, password: string) {
    this.logger.log(`Fetching timetable data for ${rollno}`);

    const [examSchedule, classTimetable] = await Promise.all([
      this.getExamSchedule(rollno, password),
      this.getClassTimetable(rollno, password),
    ]);

    return {
      examSchedule,
      classTimetable,
    };
  }
}
