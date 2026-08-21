import { v1ApiClient } from "../../lib/api/v1-client";
import type {
  MediaDetailResponse,
  MediaListFilters,
  MediaListResponse,
  MediaUpdateMetadataPayload,
  MediaUploadPayload,
  MediaUploadResponse,
} from "./media.types";

export const listMedia = async (filters: MediaListFilters = {}): Promise<MediaListResponse> => {
  const { query, type, folder, tag } = filters;
  const response = await v1ApiClient.get<MediaListResponse>("/media", {
    params: {
      ...(query ? { query } : {}),
      ...(type ? { type } : {}),
      ...(folder ? { folder } : {}),
      ...(tag ? { tag } : {}),
    },
  });
  return response.data;
};

export const getMediaDetail = async (id: string): Promise<MediaDetailResponse> => {
  const response = await v1ApiClient.get<MediaDetailResponse>(`/media/${id}`);
  return response.data;
};

export const uploadMedia = async (payload: MediaUploadPayload): Promise<MediaUploadResponse> => {
  const formData = new FormData();
  formData.append("file", payload.file);
  if (payload.customName.trim()) {
    formData.append("customName", payload.customName.trim());
  }
  const response = await v1ApiClient.post<MediaUploadResponse>("/media/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteMedia = async (id: string): Promise<void> => {
  await v1ApiClient.delete(`/media/${id}`);
};

export const updateMediaMetadata = async (
  payload: MediaUpdateMetadataPayload,
): Promise<MediaDetailResponse> => {
  const response = await v1ApiClient.patch<MediaDetailResponse>(`/media/${payload.id}`, {
    customName: payload.customName.trim() || null,
    folder: payload.folder.trim() || null,
    tags: payload.tags,
  });
  return response.data;
};
