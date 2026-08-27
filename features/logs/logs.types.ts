export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiLogRecord {
  _id: string;
  endpoint: string;
  method: string;
  requestBody: unknown;
  responseBody: unknown;
  statusCode: number;
  durationMs: number;
  success: boolean;
  createdAt: string;
}

export interface ApiLogsResponse {
  logs: ApiLogRecord[];
  pagination: PaginationMeta;
}

export interface WebhookEventRecord {
  _id: string;
  eventType: string;
  payload: unknown;
  processed: boolean;
  responseCode: number;
  responseTimeMs: number;
  errorMessage?: string;
  createdAt: string;
}

export interface WebhookLogsResponse {
  logs: WebhookEventRecord[];
  pagination: PaginationMeta;
}
