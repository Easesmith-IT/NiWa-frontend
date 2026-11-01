export interface TemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  format?: "TEXT" | "IMAGE" | "DOCUMENT" | "VIDEO" | "LOCATION";
  text?: string;
  example?: {
    header_text?: string[];
    header_handle?: string[];
    body_text?: string[][];
  };
  buttons?: Array<{
    type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER";
    text: string;
    url?: string;
    phone_number?: string;
  }>;
}

export interface MetaTemplate {
  _id: string;
  name: string;
  language: string;
  status?: string;
  category?: string;
  components?: TemplateComponent[];
}

export interface GetTemplatesParams {
  category?: string;
  language?: string;
  query?: string;
  status?: string;
}

export interface CreateTemplatePayload {
  name: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  language: string;
  components: TemplateComponent[];
  allow_category_change?: boolean;
}

export interface CreateTemplateResponse {
  success: boolean;
  template: MetaTemplate;
}

export interface DeleteTemplateResponse {
  success: boolean;
  message: string;
}

export interface UploadSampleResponse {
  success: boolean;
  headerHandle: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  format: "IMAGE" | "VIDEO" | "DOCUMENT";
}
