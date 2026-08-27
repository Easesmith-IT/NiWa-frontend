import type {
  MediaDetailResponse,
  MediaListResponse,
  MediaRecord,
  MediaUploadResponse,
} from "../../lib/api/types";

export type { MediaDetailResponse, MediaListResponse, MediaRecord, MediaUploadResponse };

export interface MediaListFilters {
  query?: string;
  type?: string;
  folder?: string;
  tag?: string;
}

export interface MediaUploadPayload {
  customName: string;
  file: File;
}

export interface MediaUpdateMetadataPayload {
  id: string;
  customName: string;
  folder: string;
  tags: string[];
}
