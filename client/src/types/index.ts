// Re-export types from server for client use
// This allows type-only imports during development

export type {
  User,
  UserCredentials,
  AuthTokens,
  AuthUser,
} from '../../../server/src/types/user';

export type {
  AttendanceResponse,
  CourseAttendance,
  AttendanceRequest,
} from '../../../server/src/types/attendance';

export type {
  CGPAResponse,
  SemesterGPA,
  CourseGrade,
  CGPARequest,
} from '../../../server/src/types/cgpa';

export type {
  ExamScheduleResponse,
  ClassTimetableResponse,
  ExamSchedule,
  TimetableSlot,
  TimetableResponse,
  ClassSchedule,
  TimetableRequest,
} from '../../../server/src/types/timetable';

export type {
  InternalsResponse,
  CourseInternal,
  InternalMark,
  LegacyInternalMark,
  InternalsRequest,
} from '../../../server/src/types/internals';

export type {
  FeedbackQuestion,
  FeedbackOption,
  FeedbackRequest,
  FeedbackResponse,
  FeedbackStatus,
} from '../../../server/src/types/feedback';

export type {
  ApiResponse,
  ErrorResponse,
  PaginatedResponse,
  HomePageData,
} from '../../../server/src/types/api';
