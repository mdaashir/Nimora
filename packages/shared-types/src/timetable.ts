// Timetable types
export interface ExamSchedule {
  courseCode: string;
  courseName: string;
  date: string;
  time: string;
  venue?: string;
  day?: string;
  session?: 'FN' | 'AN';
}

export interface ExamScheduleResponse {
  rollNo: string;
  exams: ExamSchedule[];
  lastUpdated: Date;
}

// Legacy interface for compatibility
export interface TimetableResponse {
  studentName: string;
  rollNo: string;
  exams: ExamSchedule[];
  lastUpdated: Date;
}

export interface TimetableSlot {
  period: number;
  startTime: string;
  endTime: string;
  courseCode: string;
  courseName: string;
  faculty?: string;
  room?: string;
}

export interface ClassSchedule {
  day: string;
  periods: TimetableSlot[];
}

export interface ClassTimetableResponse {
  rollNo: string;
  timetable: Record<string, TimetableSlot[]>;
  lastUpdated: Date;
}

export interface TimetableRequest {
  rollno: string;
  password: string;
}
