// Internals types
export interface InternalMark {
  testName: string;
  obtainedMarks: number;
  maxMarks: number;
  percentage: number;
}

export interface CourseInternal {
  courseCode: string;
  courseName: string;
  marks: InternalMark[];
  totalObtained: number;
  totalMax: number;
}

// Legacy interface for compatibility
export interface LegacyInternalMark {
  courseCode: string;
  courseName: string;
  internal1: number | null;
  internal2: number | null;
  internal3: number | null;
  assignment: number | null;
  totalInternal: number;
  maxInternal: number;
  requiredEndsem: number | null;
}

export interface InternalsResponse {
  rollNo: string;
  courses: CourseInternal[];
  lastUpdated: Date;
}

export interface InternalsRequest {
  rollno: string;
  password: string;
  targetGrade?: string;
}
