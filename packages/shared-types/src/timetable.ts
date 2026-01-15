// Timetable types
export interface ExamSchedule {
  courseCode: string;
  courseName: string;
  date: string;
  day: string;
  time: string;
  session: 'FN' | 'AN';
}

export interface TimetableResponse {
  studentName: string;
  rollNo: string;
  exams: ExamSchedule[];
  lastUpdated: Date;
}

export interface ClassSchedule {
  day: string;
  periods: ClassPeriod[];
}

export interface ClassPeriod {
  period: number;
  startTime: string;
  endTime: string;
  courseCode: string;
  courseName: string;
  faculty: string;
  room: string;
}

export interface ClassTimetableResponse {
  studentName: string;
  rollNo: string;
  schedule: ClassSchedule[];
  lastUpdated: Date;
}

export interface TimetableRequest {
  rollno: string;
  password: string;
}
