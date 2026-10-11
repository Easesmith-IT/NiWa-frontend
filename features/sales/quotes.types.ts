export interface QuoteLineItem {
  lineId?: string;
  productId?: string;
  productVariantId?: string;
  sku?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRatePercent?: number;
  lineTotal?: number;
}

export interface QuoteCustomer {
  customerId?: string;
  customerType: "PERSON" | "COMPANY";
  displayName: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
}

export interface QuoteItem {
  _id?: string;
  quoteId: string;
  workspaceId?: string;
  customer?: QuoteCustomer;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  currency: string;
  subtotal: number;
  discountAmount?: number;
  netAmount?: number;
  taxAmount: number;
  grandTotal: number;
  validUntil?: string | null;
  expirationDate?: string | null;
  notes?: string | null;
  terms?: string | null;
  lines?: QuoteLineItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface CurrencyTotal {
  currency: string;
  totalValue: number;
  count?: number;
}

export interface QuoteSummaryData {
  total: number;
  sentCount: number;
  acceptedCount: number;
  draftCount?: number;
  declinedCount?: number;
  expiredCount?: number;
  totalValueByCurrency: CurrencyTotal[];
  totalValue?: number | null;
}

export interface PaginatedQuotesData {
  quotes: QuoteItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary?: QuoteSummaryData;
}

export interface QuotesApiResponse {
  success: boolean;
  data: PaginatedQuotesData | QuoteItem[];
  message?: string;
}
