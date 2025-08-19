export interface BaseResponse {
  status: string;
  message: string;
  httpStatus: string;
}

export interface ApiErrorResponse {
  status: string;
  message: string;
  httpStatus: string;
  traceId: string;
  errors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}