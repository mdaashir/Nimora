import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { EcampusAuthService } from './ecampus-auth.service';
import type { CGPAResponse, SemesterGPA, CourseGrade } from '@nimora/shared-types';
import { getGradePoint } from '@nimora/shared-utils';

@Injectable()
export class CgpaScraperService {
  private readonly logger = new Logger(CgpaScraperService.name);

  constructor(private readonly ecampusAuth: EcampusAuthService) {}

  /**
   * Scrape CGPA data from eCampus studzone2
   */
  async scrapeCgpa(rollno: string, password: string): Promise<CGPAResponse> {
    const { browser, page } = await this.ecampusAuth.loginStudzone2(
      rollno,
      password,
    );

    try {
      // Navigate to CGPA page (adjust URL as needed)
      await page.goto(
        'https://ecampus.psgtech.ac.in/studzone2/CAMarksView',
        {
          waitUntil: 'networkidle2',
          timeout: 30000,
        },
      );

      const content = await page.content();
      const $ = cheerio.load(content);

      const studentName = this.extractStudentName($);
      const { semesterWise, courses, totalCredits } = this.extractGradeData($);
      const currentCGPA = this.calculateCurrentCGPA(semesterWise);

      return {
        studentName,
        rollNo: rollno.toUpperCase(),
        currentCGPA,
        completedSemesters: semesterWise.length,
        totalCredits,
        semesterWise,
        courses,
        lastUpdated: new Date(),
      };
    } finally {
      await this.ecampusAuth.closeBrowser(browser);
    }
  }

  private extractStudentName($: cheerio.CheerioAPI): string {
    return $('span.student-name').first().text().trim() || 'Student';
  }

  private extractGradeData($: cheerio.CheerioAPI): {
    semesterWise: SemesterGPA[];
    courses: CourseGrade[];
    totalCredits: number;
  } {
    const courses: CourseGrade[] = [];
    const semesterMap = new Map<number, { gpa: number; credits: number }>();
    let totalCredits = 0;

    // Extract from grade table (adjust selectors based on actual HTML)
    $('table tbody tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 4) {
        const courseCode = $(cells[0]).text().trim();
        const courseName = $(cells[1]).text().trim();
        const creditsStr = $(cells[2]).text().trim();
        const grade = $(cells[3]).text().trim().toUpperCase();

        const credits = parseInt(creditsStr) || 0;
        const gradePoint = getGradePoint(grade);

        if (courseCode && credits > 0) {
          courses.push({
            courseCode,
            courseName,
            credits,
            grade,
            gradePoint,
          });
          totalCredits += credits;
        }
      }
    });

    // Calculate semester-wise GPA (simplified - would need actual semester mapping)
    const semesterWise: SemesterGPA[] = [];

    return { semesterWise, courses, totalCredits };
  }

  private calculateCurrentCGPA(semesterWise: SemesterGPA[]): number {
    if (semesterWise.length === 0) return 0;

    const totalCredits = semesterWise.reduce((sum, s) => sum + s.credits, 0);
    const weightedSum = semesterWise.reduce(
      (sum, s) => sum + s.gpa * s.credits,
      0,
    );

    return totalCredits > 0
      ? Math.round((weightedSum / totalCredits) * 100) / 100
      : 0;
  }
}
