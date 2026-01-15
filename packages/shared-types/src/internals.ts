// Internals types
export interface InternalMark {
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
  studentName: string;
  rollNo: string;
  semester: number;
  marks: InternalMark[];
  lastUpdated: Date;
}

export interface InternalsRequest {
  rollno: string;
  password: string;
  targetGrade?: string;
}
