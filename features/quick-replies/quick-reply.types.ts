export interface QuickReplyRecord {
  _id: string;
  attachmentMediaId?: string | null;
  body: string;
  category?: string | null;
  createdAt?: string;
  isActive: boolean;
  shortcut: string;
  title: string;
  updatedAt?: string;
  variables: string[];
}
