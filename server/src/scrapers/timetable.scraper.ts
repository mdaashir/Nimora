import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as cheerio from "cheerio";
import { EcampusAuthService } from "./ecampus-auth.service";
import type {
  ClassTimetableResponse,
  ExamScheduleResponse,
  ExamSchedule,
  TimetableSlot,
} from "../types";

@Injectable()
export class TimetableScraperService {
  private readonly logger = new Logger(TimetableScraperService.name);
  private readonly timeout: number;
  private readonly baseUrl: string;
  private readonly timetableUrls: {
    EXAM_SCHEDULE: string;
    CLASS_TIMETABLE: string;
  };

  constructor(
    private readonly ecampusAuth: EcampusAuthService,
    private readonly configService: ConfigService,
  ) {
    this.timeout = parseInt(
      this.configService.get<string>("SCRAPER_TIMEOUT"),
      10,
    );
    this.baseUrl = this.configService.get("ECAMPUS_BASE_URL");
    this.timetableUrls = {
      EXAM_SCHEDULE: `${this.baseUrl}/studzone/ContinuousAssessment/CATestTimeTable`,
      CLASS_TIMETABLE: `${this.baseUrl}/studzone/Attendance/courseplan`,
    };
  }

  /**
   * Scrape exam schedule from eCampus
   */
  async scrapeExamSchedule(
    rollno: string,
    password: string,
  ): Promise<ExamScheduleResponse> {
    const { browser, page } = await this.ecampusAuth.loginStudzone(
      rollno,
      password,
    );

    try {
      // First get course names mapping
      const courseMap = await this.getCourseNames(page);

      // Navigate to exam schedule page
      await page.goto(this.timetableUrls.EXAM_SCHEDULE, {
        waitUntil: "networkidle2",
        timeout: this.timeout,
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      const exams = this.extractExamSchedule($, courseMap);

      return {
        rollNo: rollno.toUpperCase(),
        exams,
        lastUpdated: new Date(),
      };
    } finally {
      await this.ecampusAuth.closeBrowser(browser);
    }
  }

  /**
   * Scrape class timetable from eCampus
   */
  async scrapeClassTimetable(
    rollno: string,
    password: string,
  ): Promise<ClassTimetableResponse> {
    const { browser, page } = await this.ecampusAuth.loginStudzone(
      rollno,
      password,
    );

    try {
      await page.goto(this.timetableUrls.EXAM_SCHEDULE, {
        waitUntil: "networkidle2",
        timeout: this.timeout,
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      const timetable = this.extractClassTimetable($);

      return {
        rollNo: rollno.toUpperCase(),
        timetable,
        lastUpdated: new Date(),
      };
    } finally {
      await this.ecampusAuth.closeBrowser(browser);
    }
  }

  /**
   * Get course code to course name initials mapping
   */
  private async getCourseNames(page: any): Promise<Map<string, string>> {
    await page.goto(this.timetableUrls.CLASS_TIMETABLE, {
      waitUntil: "networkidle2",
      timeout: this.timeout,
    });

    const content = await page.content();
    const $ = cheerio.load(content);
    const courseMap = new Map<string, string>();

    $("div.col-md-8").each((_, div) => {
      const courseCode = $(div).find("h5").text().trim();
      const courseName = $(div).find("h6").text().trim();

      if (courseCode && courseName) {
        const initials = courseName
          .split(/\s+/)
          .filter((word) => word.length > 0 && word[0].match(/[A-Z]/))
          .map((word) => word[0])
          .join("");

        courseMap.set(courseCode, initials);
      }
    });

    return courseMap;
  }

  /**
   * Extract exam schedule from Test-card divs
   * Based on Python implementation
   */
  private extractExamSchedule(
    $: cheerio.CheerioAPI,
    courseMap: Map<string, string>,
  ): ExamSchedule[] {
    const exams: ExamSchedule[] = [];

    // Check for presence of schedule content
    const hasContent =
      $("div.Test-card").length > 0 ||
      $("div.test-card").length > 0 ||
      $("div.exam-card").length > 0;

    if (!hasContent) {
      this.logger.warn("No exam schedule content found");
      return exams;
    }

    // Try multiple selectors for exam containers
    let examContainers = $("div.text-left");
    if (examContainers.length === 0) {
      examContainers = $("div.exam-item");
    }
    if (examContainers.length === 0) {
      examContainers = $("div.card");
    }

    this.logger.log(`Found ${examContainers.length} exam containers`);

    examContainers.each((_, exam) => {
      const examEl = $(exam);

      // Try to extract course code, date, and time
      let courseCode: string | null = null;
      let dateStr: string | null = null;
      let timeStr: string | null = null;

      // Look for span.sol elements (based on Python)
      const spans = examEl.find("span.sol");
      if (spans.length > 0) {
        courseCode = $(spans[0]).text().trim().replace(/^:/, "").trim();

        spans.each((i, span) => {
          if (i === 0) return;
          const text = $(span).text().trim().replace(/^:/, "").trim();

          if (this.isDate(text)) {
            dateStr = text;
          } else if (this.isTime(text)) {
            timeStr = text;
          }
        });
      }

      // Fallback: try to find from entire text
      if (!dateStr || !timeStr) {
        const fullText = examEl.text();

        // Look for date patterns
        const dateMatch = fullText.match(/(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})/);
        if (dateMatch && !dateStr) {
          dateStr = dateMatch[1];
        }

        // Look for time patterns
        const timeMatch = fullText.match(
          /(\d{1,2}:\d{2}(?:\s*(?:AM|PM|am|pm))?)/,
        );
        if (timeMatch && !timeStr) {
          timeStr = timeMatch[1];
        }
      }

      if (courseCode && dateStr) {
        const courseInitials = courseMap.get(courseCode) || "";
        const courseName = courseInitials
          ? `${courseCode} - ${courseInitials}`
          : courseCode;

        exams.push({
          courseCode,
          courseName,
          date: dateStr,
          time: timeStr || "TBD",
          venue: "", // Can be extracted if available
        });
      }
    });

    return exams;
  }

  /**
   * Extract class timetable
   */
  private extractClassTimetable(
    _$: cheerio.CheerioAPI,
  ): Record<string, TimetableSlot[]> {
    const timetable: Record<string, TimetableSlot[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
    };

    // Timetable extraction logic would depend on actual HTML structure
    // This is a placeholder implementation

    return timetable;
  }

  /**
   * Check if a string looks like a date
   */
  private isDate(text: string): boolean {
    // Check for common date patterns
    return /\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}/.test(text);
  }

  /**
   * Check if a string looks like a time
   */
  private isTime(text: string): boolean {
    // Check for common time patterns
    return /\d{1,2}:\d{2}/.test(text);
  }
}
