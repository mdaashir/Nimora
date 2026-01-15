// Feedback types
export interface FeedbackQuestion {
  questionId: string;
  questionText: string;
  options: FeedbackOption[];
}

export interface FeedbackOption {
  value: number;
  label: string;
}

export interface FeedbackRequest {
  rollno: string;
  password: string;
  feedbackIndex?: number;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  completedCount: number;
  totalCount: number;
}

export interface FeedbackStatus {
  pending: number;
  completed: number;
  total: number;
}
