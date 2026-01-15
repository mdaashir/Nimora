import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { EcampusAuthService } from './ecampus-auth.service';
import type { AttendanceResponse, CourseAttendance } from '@nimora/shared-types';
import {
  calculateBunkableClasses,
  calculateClassesNeeded,
  calculateAttendancePercentage,
} from '@nimora/shared-utils';

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
      // Navigate to attendance page
      await page.goto(
        'https://ecampus.psgtech.ac.in/studzone/Abortallattt',
        {
          waitUntil: 'networkidle2',
          timeout: 30000,
        },
      );

      // Get page content
      const content = await page.content();
      const $ = cheerio.load(content);

      // Extract student name
      const studentName = this.extractStudentName($);

      // Extract attendance table
      const courses = this.extractAttendanceTable($, threshold);

      // Calculate overall percentage
      const totalAttended = courses.reduce((sum, c) => sum + c.attendedClasses, 0);
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
   * Extract student name from page
   */
  private extractStudentName($: cheerio.CheerioAPI): string {
    // Try different selectors
    const nameElement = $('span.student-name').first().text() ||
      $('td:contains("Name")').next().text() ||
      'Student';
    return nameElement.trim();
  }

  /**
   * Extract attendance data from table
   */
  private extractAttendanceTable(
    $: cheerio.CheerioAPI,
    threshold: number,
  ): CourseAttendance[] {
    const courses: CourseAttendance[] = [];

    // Find attendance table (adjust selector based on actual HTML)
    $('table tbody tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 4) {
        const courseCode = $(cells[0]).text().trim();
        const courseName = $(cells[1]).text().trim();
        const attendedStr = $(cells[2]).text().trim();
        const totalStr = $(cells[3]).text().trim();

        const attended = parseInt(attendedStr) || 0;
        const total = parseInt(totalStr) || 0;

        if (courseCode && total > 0) {
          const percentage = calculateAttendancePercentage(attended, total);
          const canBunk = calculateBunkableClasses(attended, total, threshold);
          const mustAttend = calculateClassesNeeded(attended, total, threshold);

          courses.push({
            courseCode,
            courseName,
            totalClasses: total,
            attendedClasses: attended,
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
