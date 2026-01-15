import { Injectable, Logger } from "@nestjs/common";
import * as cheerio from "cheerio";
import { EcampusAuthService } from "./ecampus-auth.service";
import type { InternalsResponse, InternalMark, CourseInternal } from "../types";

const INTERNALS_URL =
  "https://ecampus.psgtech.ac.in/studzone/ContinuousAssessment/CAMarksView";

@Injectable()
export class InternalsScraperService {
  private readonly logger = new Logger(InternalsScraperService.name);

  constructor(private readonly ecampusAuth: EcampusAuthService) {}

  /**
   * Scrape internal marks from eCampus
   */
  async scrapeInternals(
    rollno: string,
    password: string,
  ): Promise<InternalsResponse> {
    const { browser, page } = await this.ecampusAuth.loginStudzone(
      rollno,
      password,
    );

    try {
      // Navigate to internals page
      await page.goto(INTERNALS_URL, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      const courses = this.extractInternals($);

      return {
        rollNo: rollno.toUpperCase(),
        courses,
        lastUpdated: new Date(),
      };
    } finally {
      await this.ecampusAuth.closeBrowser(browser);
    }
  }

  /**
   * Extract internal marks from the page
   */
  private extractInternals($: cheerio.CheerioAPI): CourseInternal[] {
    const courses: CourseInternal[] = [];

    // Try to find course containers
    // The actual structure depends on eCampus HTML
    $("div.card, div.course-card, table tbody tr").each((_, element) => {
      const el = $(element);

      // Try to extract course info
      const courseCode = el
        .find(".course-code, h5, td:first-child")
        .first()
        .text()
        .trim();
      const courseName = el
        .find(".course-name, h6, td:nth-child(2)")
        .first()
        .text()
        .trim();

      if (!courseCode) return;

      const marks: InternalMark[] = [];

      // Look for internal test marks
      el.find(".test-mark, .internal-mark, td.mark").each((_, markEl) => {
        const markText = $(markEl).text().trim();
        const markMatch = markText.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+)/);

        if (markMatch) {
          marks.push({
            testName: "Internal",
            obtainedMarks: parseFloat(markMatch[1]),
            maxMarks: parseFloat(markMatch[2]),
            percentage:
              (parseFloat(markMatch[1]) / parseFloat(markMatch[2])) * 100,
          });
        }
      });

      // Only add if we found valid data
      if (marks.length > 0) {
        courses.push({
          courseCode,
          courseName,
          marks,
          totalObtained: marks.reduce((sum, m) => sum + m.obtainedMarks, 0),
          totalMax: marks.reduce((sum, m) => sum + m.maxMarks, 0),
        });
      }
    });

    return courses;
  }
}
