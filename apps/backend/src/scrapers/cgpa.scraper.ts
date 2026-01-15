import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { EcampusAuthService } from './ecampus-auth.service';
import type { CGPAResponse, SemesterGPA, CourseGrade } from '@nimora/shared-types';
import { getGradePoint } from '@nimora/shared-utils';

const CGPA_URLS = {
  COURSE_SELECTION: 'https://ecampus.psgtech.ac.in/studzone2/AttWfStudCourseSelection.aspx',
  RESULTS: 'https://ecampus.psgtech.ac.in/studzone2/FrmEpsStudResult.aspx',
};

// Grade to grade point mapping (matching Python implementation)
const GRADE_MAP: Record<string, number> = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'RA': 0,
  'U': 0,
  'W': 0,
};

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
      // First get completed semester info
      const completedSemester = await this.getCompletedSemester(page);

      // Navigate to course selection page for grades
      await page.goto(CGPA_URLS.COURSE_SELECTION, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      const studentName = this.extractStudentName($);
      const { courses, mostRecentSemester } = this.extractCourseData($);
      const { semesterWise, currentCGPA, totalCredits } = this.calculateCGPA(
        courses,
        mostRecentSemester,
        completedSemester,
      );

      return {
        studentName,
        rollNo: rollno.toUpperCase(),
        currentCGPA,
        completedSemesters: completedSemester - 1,
        totalCredits,
        semesterWise,
        courses,
        lastUpdated: new Date(),
      };
    } finally {
      await this.ecampusAuth.closeBrowser(browser);
    }
  }

  /**
   * Get completed semester from results page
   * Returns the least semester with RA or next semester if none
   */
  private async getCompletedSemester(page: any): Promise<number> {
    await page.goto(CGPA_URLS.RESULTS, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    const content = await page.content();
    const $ = cheerio.load(content);

    let semIndex = 1;
    const table = $('table#DgResult');

    table.find('tr').each((i, row) => {
      if (i === 0) return; // Skip header row

      const cells = $(row).find('td');
      const semCell = $(cells[0]).text().trim();
      const resultCell = $(cells[5]).text().trim();

      if (semCell !== ' ' && semCell !== '') {
        semIndex = parseInt(semCell) || semIndex;
      }

      if (resultCell === 'RA') {
        return false; // Break loop - return this semester
      }
    });

    return semIndex + 1;
  }

  private extractStudentName($: cheerio.CheerioAPI): string {
    return $('span.student-name').first().text().trim() || 'Student';
  }

  /**
   * Extract course data from PDGCourse table
   */
  private extractCourseData($: cheerio.CheerioAPI): {
    courses: CourseGrade[];
    mostRecentSemester: number;
  } {
    const courses: CourseGrade[] = [];
    let mostRecentSemester = 1;

    const table = $('table#PDGCourse');

    table.find('tr').each((i, row) => {
      if (i === 0) return; // Skip header row

      const cells = $(row).find('td');
      if (cells.length >= 8) {
        // Based on Python: row[1]=code, row[4]=credits, row[6]=grade, row[7]=semester
        const courseCode = $(cells[1]).text().trim();
        const courseName = $(cells[2]).text().trim();
        const credits = parseInt($(cells[4]).text().trim()) || 0;
        const grade = $(cells[6]).text().trim().toUpperCase();
        const semester = parseInt($(cells[7]).text().trim()) || 1;

        const gradePoint = GRADE_MAP[grade] ?? getGradePoint(grade);

        if (courseCode && credits > 0) {
          courses.push({
            courseCode,
            courseName,
            credits,
            grade,
            gradePoint,
            semester,
          });

          if (semester > mostRecentSemester) {
            mostRecentSemester = semester;
          }
        }
      }
    });

    return { courses, mostRecentSemester };
  }

  /**
   * Calculate CGPA semester-wise (matching Python implementation)
   */
  private calculateCGPA(
    courses: CourseGrade[],
    mostRecentSemester: number,
    completedSemester: number,
  ): {
    semesterWise: SemesterGPA[];
    currentCGPA: number;
    totalCredits: number;
  } {
    const semesterWise: SemesterGPA[] = [];
    let overallProduct = 0;
    let overallCredits = 0;
    let hasBacklogs = false;

    for (let sem = 1; sem <= mostRecentSemester; sem++) {
      if (hasBacklogs) {
        // Add placeholder for pending semesters
        semesterWise.push({
          semester: sem,
          gpa: 0,
          cgpa: 0,
          credits: 0,
          isPending: true,
        });
        continue;
      }

      const semesterCourses = courses.filter((c) => c.semester === sem);

      // Check for backlogs in this semester
      if (sem >= completedSemester) {
        const hasRA = semesterCourses.some(
          (c) => c.grade === 'RA' || c.grade === 'U',
        );
        if (hasRA) {
          hasBacklogs = true;
          semesterWise.push({
            semester: sem,
            gpa: 0,
            cgpa: 0,
            credits: 0,
            isPending: true,
          });
          continue;
        }
      }

      // Calculate semester GPA
      let semProduct = 0;
      let semCredits = 0;

      for (const course of semesterCourses) {
        semProduct += course.gradePoint * course.credits;
        semCredits += course.credits;
      }

      const semGpa = semCredits > 0 ? semProduct / semCredits : 0;
      overallProduct += semProduct;
      overallCredits += semCredits;

      const cgpa = overallCredits > 0 ? overallProduct / overallCredits : 0;

      semesterWise.push({
        semester: sem,
        gpa: Math.round(semGpa * 100) / 100,
        cgpa: Math.round(cgpa * 100) / 100,
        credits: semCredits,
        isPending: false,
      });
    }

    const currentCGPA =
      overallCredits > 0
        ? Math.round((overallProduct / overallCredits) * 100) / 100
        : 0;

    return {
      semesterWise,
      currentCGPA,
      totalCredits: overallCredits,
    };
  }
}
