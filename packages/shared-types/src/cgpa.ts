// CGPA types
export interface SemesterGPA {
  semester: number;
  gpa: number;
  cgpa: number;
  credits: number;
}

export interface CourseGrade {
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  gradePoint: number;
}

export interface CGPAResponse {
  studentName: string;
  rollNo: string;
  currentCGPA: number;
  completedSemesters: number;
  totalCredits: number;
  semesterWise: SemesterGPA[];
  courses: CourseGrade[];
  lastUpdated: Date;
}

export interface CGPARequest {
  rollno: string;
  password: string;
}

// Grade mapping
export const GRADE_POINTS: Record<string, number> = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'P': 4,
  'RA': 0,
  'SA': 0,
  'W': 0,
};
