export interface SettingsPayload {
  appId: string;
  appSecret: string;
  accessToken: string;
  businessAccountId: string;
  phoneNumberId: string;
  verifyToken: string;
  webhookUrl: string;
  apiVersion: string;
  cloudApiBaseUrl: string;
}

export interface SettingsResponse {
  settings: SettingsPayload;
  secretsConfigured?: {
    appSecret: boolean;
    accessToken: boolean;
    verifyToken: boolean;
  };
  metaWebhookEndpoint: string;
}

export interface ConnectionTestResponse {
  success: boolean;
  message: string;
  missingFields: string[];
  testedAt: string;
  statusCode?: number;
  responseBody?: unknown;
}

export interface WebhookEventRecord {
  _id: string;
  storageKind?: string;
  eventType: string;
  objectType?: string;
  eventCategory?: string;
  eventSummary?: string;
  payload: unknown;
  processed: boolean;
  processingState?: string;
  retryStatus: string;
  responseCode: number;
  responseTimeMs: number;
  errorMessage?: string;
  createdAt: string;
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

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiLogsResponse {
  logs: ApiLogRecord[];
  pagination: PaginationMeta;
}

export interface WebhookLogsResponse {
  logs: WebhookEventRecord[];
  pagination: PaginationMeta;
}

export interface WebhooksResponse {
  metaWebhookEndpoint: string;
  configuredWebhookUrl: string;
  callbackUrlMatchesBackendEndpoint?: boolean;
  metaAppSubscriptions?: Array<Record<string, unknown>>;
  metaCallbackUrl?: string | null;
  metaPhoneNumberWebhookConfiguration?: Record<string, unknown> | null;
  metaWebhookDiagnosticsMissingFields?: string[];
  verifyTokenConfigured: boolean;
  apiVersion: string;
  verificationStatus?: string;
  subscriptionHealth?: string;
  totalEvents: number;
  lastEventAt: string | null;
  events: WebhookEventRecord[];
}

export interface WebhookReconcileResponse {
  success: boolean;
  message: string;
  requestBody: unknown;
  responseBody: unknown;
  diagnostics: {
    appSubscriptions: Array<Record<string, unknown>>;
    callbackUrlMatchesBackendEndpoint: boolean;
    metaCallbackUrl: string | null;
    metaPhoneNumberWebhookConfiguration: Record<string, unknown> | null;
    metaWebhookEndpoint: string;
    missingFields: string[];
    savedWebhookUrl: string;
    verifyTokenConfigured: boolean;
  };
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface ProfileResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface ProfileUpdatePayload {
  name: string;
}

export interface PasswordChangePayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface BasicMessageResponse {
  message: string;
}

export interface OutboundMessageResponse {
  message: {
    _id: string;
    waMessageId: string;
    messageType: string;
    to: string;
    status: string;
  } | null;
  requestPayload: unknown;
  response: unknown;
}

export interface TemplateRecord {
  _id: string;
  metaTemplateId: string;
  name: string;
  category: string;
  language: string;
  status: string;
  variables: string[];
  bodyText?: string;
  bodyVariableCount?: number;
  bodyVariables?: string[];
  buttonCount?: number;
  footerText?: string;
  headerFormat?: string;
  headerMediaRequired?: boolean;
  headerText?: string;
  headerVariableCount?: number;
  headerVariables?: string[];
  isSendable?: boolean;
  sendabilityReason?: string | null;
  supportedFeatures?: string[];
  unsupportedReasons?: string[];
  urlButtons?: Array<{
    dynamic?: boolean;
    example?: unknown;
    index: number;
    phoneNumber?: string;
    text: string;
    type: string;
    url?: string;
    variableCount?: number;
  }>;
  components: Array<{
    type: string;
    format?: string;
    text?: string;
    example?: unknown;
    buttons?: Array<{
      type?: string;
      text?: string;
      url?: string;
      phone_number?: string;
      example?: unknown;
    }>;
  }>;
  rawPayload: unknown;
  updatedAt: string;
}

export interface TemplatesResponse {
  templates: TemplateRecord[];
  lastSyncedAt?: string | null;
}

export interface TemplateResponse {
  template: TemplateRecord;
}

export interface TemplateSyncResponse {
  count: number;
  templates: TemplateRecord[];
}

export interface MediaRecord {
  _id: string;
  metaMediaId: string;
  customName?: string | null;
  fileName: string;
  mimeType: string;
  mediaType: string;
  fileSize: number;
  folder?: string | null;
  tags?: string[];
  uploadedAt: string;
  requestPayload?: unknown;
  responsePayload: unknown;
}

export interface MediaListResponse {
  media: MediaRecord[];
}

export interface MediaDetailResponse {
  media: MediaRecord;
}

export interface MediaUploadResponse {
  media: MediaRecord;
}

export interface ConversationRecord {
  _id: string;
  contactId: string;
  waId: string;
  contactPhoneNumber: string;
  contactName: string;
  lastMessageText: string;
  lastMessageType: string;
  lastDirection: "incoming" | "outgoing";
  lastActivityAt: string;
  lastMessageStatus: string;
  unreadCount: number;
  labels: string[];
  notes: ConversationNoteRecord[];
  activityFeed: ConversationActivityRecord[];
}

export interface ConversationMessageRecord {
  _id: string;
  waMessageId?: string;
  conversationId: string | null;
  contactId: string | null;
  direction: "incoming" | "outgoing";
  messageType: string;
  to: string;
  from: string;
  previewText: string;
  timestamp: string;
  payload: unknown;
  status: string;
}

export interface ConversationNoteHistoryRecord {
  content: string;
  editedAt: string;
  editedById: string;
  editedByName: string;
}

export interface ConversationNoteRecord {
  _id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorName: string;
  pinned: boolean;
  history: ConversationNoteHistoryRecord[];
}

export interface ConversationActivityRecord {
  _id: string;
  type: string;
  description: string;
  actorId?: string;
  actorName: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface ConversationsResponse {
  conversations: ConversationRecord[];
  pagination?: PaginationMeta;
}

export interface ConversationDetailResponse {
  conversation: ConversationRecord;
  messages: ConversationMessageRecord[];
}

export interface DashboardApiError {
  _id: string;
  endpoint: string;
  method: string;
  statusCode: number;
  durationMs: number;
  createdAt: string;
}

export interface DashboardResponse {
  connectedPhoneNumber: string;
  businessName: string;
  businessAccountId: string;
  phoneNumberId: string;
  webhookStatus: string;
  webhookUrlConfigured: boolean;
  verifyTokenConfigured: boolean;
  unreadConversations: number;
  totalConversations: number;
  apiCallsToday: number;
  webhookEventsToday: number;
  recentApiErrors: DashboardApiError[];
  recentActivity: ConversationRecord[];
  recentWebhooks: WebhookEventRecord[];
  trends?: {
    apiCallsMonth: number;
    webhookFailuresToday: number;
    deliveredStatusesToday: number;
    readStatusesToday: number;
    failedStatusesToday: number;
  };
  counters: {
    templates: number;
    media: number;
    incomingMessagesToday: number;
    outgoingMessagesToday: number;
    incomingMessagesMonth: number;
    outgoingMessagesMonth: number;
  };
}

export interface ConversationReadResponse {
  conversationId: string;
  unreadCount: number;
}

export interface MediaReplyResponse extends OutboundMessageResponse {}

export interface ConversationLabelsResponse {
  conversation: ConversationRecord;
}

export interface ConversationNoteMutationResponse {
  conversation: ConversationRecord;
  note: ConversationNoteRecord;
}
