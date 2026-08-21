export interface TemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  format?: "TEXT" | "IMAGE" | "DOCUMENT" | "VIDEO";
  text?: string;
  example?: {
    header_text?: string[];
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
