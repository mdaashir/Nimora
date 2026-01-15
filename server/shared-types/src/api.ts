// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}

// Home page combined data
export interface HomePageData {
  studentName: string;
  rollNo: string;
  department: string;
  batch: string;
  avatarUrl?: string;
}
