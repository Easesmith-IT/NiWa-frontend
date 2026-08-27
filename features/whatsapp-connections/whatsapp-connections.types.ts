export interface WhatsAppConnectionRecord {
  _id: string;
  wabaId: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  verifiedName: string;
  qualityRating: string;
  status: string;
  codeVerificationStatus: string;
  businessId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppConnectionsResponse {
  connections: WhatsAppConnectionRecord[];
}

export interface EmbeddedSignupResponse {
  message: string;
  connection: WhatsAppConnectionRecord;
}
