export interface ApiResponse<T = any> {
  data: T;
  status: string;
  message: string;
  statusCode: number;
}
