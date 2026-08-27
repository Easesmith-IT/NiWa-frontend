export interface QuotaData {
  limit: number;
  used: number;
  reserved: number;
  released: number;
  available: number;
  dateString: string;
}

export interface QuotaScheduleItem {
  dateString: string;
  recipientsPlanned: number;
  availableCapacity: number;
  remaining: number;
}

export interface QuotaForecastResponse {
  data: {
    forecast: number;
    current?: QuotaData;
    estimatedCompletionDate?: string;
    schedule?: QuotaScheduleItem[];
  };
}

export interface QuotaQueryParams {
  connectionId?: string;
}

export interface QuotaForecastQueryParams {
  connectionId?: string;
  timezone?: string;
  recipientCount?: number;
  startDate?: string;
}
