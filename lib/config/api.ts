export interface ApiResponse<T = any, M = any> {
  data: T;
  status: string;
  message: string;
  statusCode: number;
  meta: M;
}
