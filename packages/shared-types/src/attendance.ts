// Attendance types
export interface CourseAttendance {
  courseCode: string;
  courseName: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  canBunk: number;
  mustAttend: number;
}

export interface AttendanceResponse {
  studentName: string;
  rollNo: string;
  overallPercentage: number;
  courses: CourseAttendance[];
  lastUpdated: Date;
}

export interface AttendanceRequest {
  rollno: string;
  password: string;
  threshold?: number;
}
