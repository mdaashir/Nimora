import { Injectable, Logger } from "@nestjs/common";
import * as cheerio from "cheerio";
import { EcampusAuthService } from "./ecampus-auth.service";
import type {
  AttendanceResponse,
  CourseAttendance,
} from "@nimora/types";
import {
  calculateBunkableClasses,
  calculateClassesNeeded,
  calculateAttendancePercentage,
} from "@nimora/shared-utils";

const ATTENDANCE_URLS = {
  STUDENT_PERCENTAGE:
    "https://ecampus.psgtech.ac.in/studzone/Attendance/StudentPercentage",
  COURSE_PLAN: "https://ecampus.psgtech.ac.in/studzone/Attendance/courseplan",
};

@Injectable()
export class AttendanceScraperService {
  private readonly logger = new Logger(AttendanceScraperService.name);

  constructor(private readonly ecampusAuth: EcampusAuthService) {}

  /**
   * Scrape attendance data from eCampus
   */
  async scrapeAttendance(
    rollno: string,
    password: string,
    threshold: number = 75,
  ): Promise<AttendanceResponse> {
    const { browser, page } = await this.ecampusAuth.loginStudzone(
      rollno,
      password,
    );

    try {
      // First get course names mapping
      const courseMap = await this.getCourseNames(page);

      // Navigate to attendance page
      await page.goto(ATTENDANCE_URLS.STUDENT_PERCENTAGE, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Get page content
      const content = await page.content();
      const $ = cheerio.load(content);

      // Extract student name from page (if available)
      const studentName = this.extractStudentName($);

      // Extract attendance table
      const courses = this.extractAttendanceTable($, threshold, courseMap);

      // Calculate overall percentage
      const totalAttended = courses.reduce(
        (sum, c) => sum + c.attendedClasses,
        0,
      );
      const totalClasses = courses.reduce((sum, c) => sum + c.totalClasses, 0);
      const overallPercentage = calculateAttendancePercentage(
        totalAttended,
        totalClasses,
      );

      return {
        studentName,
        rollNo: rollno.toUpperCase(),
        overallPercentage,
        courses,
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
    await page.goto(ATTENDANCE_URLS.COURSE_PLAN, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    const content = await page.content();
    const $ = cheerio.load(content);
    const courseMap = new Map<string, string>();

    // Extract course details from col-md-8 divs
    $("div.col-md-8").each((_, div) => {
      const courseCode = $(div).find("h5").text().trim();
      const courseName = $(div).find("h6").text().trim();

      if (courseCode && courseName) {
        // Get initials from course name (first letter of each word)
        const initials = courseName
          .split(/\s+/)
          .filter((word) => word.length > 0 && word[0].match(/[A-Z]/))
          .map((word) => word[0])
          .join("");

        courseMap.set(courseCode, initials);
      }
    });

    this.logger.log(`Found ${courseMap.size} courses`);
    return courseMap;
  }

  /**
   * Extract student name from page
   */
  private extractStudentName($: cheerio.CheerioAPI): string {
    // Try different selectors based on eCampus structure
    const nameElement =
      $("span.student-name").first().text() ||
      $('td:contains("Name")').next().text() ||
      $("h4.student-name").first().text() ||
      "Student";
    return nameElement.trim();
  }

  /**
   * Extract attendance data from table
   * Based on Python implementation - table#example with tbody > tr
   */
  private extractAttendanceTable(
    $: cheerio.CheerioAPI,
    threshold: number,
    courseMap: Map<string, string>,
  ): CourseAttendance[] {
    const courses: CourseAttendance[] = [];

    // Find attendance table with id "example"
    const table = $("table#example tbody");

    table.find("tr").each((_, row) => {
      const cells = $(row).find("td");

      if (cells.length >= 5) {
        // Based on Python: record[0]=course_code, record[1]=total, record[4]=present
        const courseCode = $(cells[0]).text().trim();
        const totalClasses = parseInt($(cells[1]).text().trim()) || 0;
        const attendedClasses = parseInt($(cells[4]).text().trim()) || 0;

        if (courseCode && totalClasses > 0) {
          // Get course name initials from map
          const courseInitials = courseMap.get(courseCode) || "";
          const courseName = courseInitials
            ? `${courseCode} - ${courseInitials}`
            : courseCode;

          const percentage = calculateAttendancePercentage(
            attendedClasses,
            totalClasses,
          );
          const canBunk = calculateBunkableClasses(
            attendedClasses,
            totalClasses,
            threshold,
          );
          const mustAttend = calculateClassesNeeded(
            attendedClasses,
            totalClasses,
            threshold,
          );

          courses.push({
            courseCode,
            courseName,
            totalClasses,
            attendedClasses,
            percentage,
            canBunk,
            mustAttend,
          });
        }
      }
    });

    return courses;
  }
}
