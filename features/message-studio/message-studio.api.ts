import { v1ApiClient } from "../../lib/api/v1-client";
import type { MediaListResponse, MediaUploadResponse, OutboundMessageResponse, TemplatesResponse } from "../../lib/api/types";
import type { SendMessageRequest, TemplateHeaderUploadRequest } from "./message-studio.types";

export const getMessageStudioTemplates = async (): Promise<TemplatesResponse> => {
  const response = await v1ApiClient.get<TemplatesResponse>("/templates");
  return response.data;
};

export const getMessageStudioMedia = async (): Promise<MediaListResponse> => {
  const response = await v1ApiClient.get<MediaListResponse>("/media");
  return response.data;
};

export const sendMessage = async ({ endpoint, payload }: SendMessageRequest): Promise<OutboundMessageResponse> => {
  const response = await v1ApiClient.post<OutboundMessageResponse>(endpoint, payload);
  return response.data;
};

export const uploadTemplateHeaderMedia = async ({
  customName,
  file,
}: TemplateHeaderUploadRequest): Promise<MediaUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  if (customName.trim()) {
    formData.append("customName", customName.trim());
  }
  const response = await v1ApiClient.post<MediaUploadResponse>("/media/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
