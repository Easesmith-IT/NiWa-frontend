import { apiClient } from "../../lib/api/client";
import { MediaListResponse, MediaUploadResponse, OutboundMessageResponse, TemplatesResponse } from "../../lib/api/types";
import { SendMessageRequest, TemplateHeaderUploadRequest } from "./message-studio.types";

export const getMessageStudioTemplates = async (): Promise<TemplatesResponse> => {
  const response = await apiClient.get<TemplatesResponse>("/templates");
  return response.data;
};

export const getMessageStudioMedia = async (): Promise<MediaListResponse> => {
  const response = await apiClient.get<MediaListResponse>("/media");
  return response.data;
};

export const sendMessage = async ({ endpoint, payload }: SendMessageRequest): Promise<OutboundMessageResponse> => {
  const response = await apiClient.post<OutboundMessageResponse>(endpoint, payload);
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
  const response = await apiClient.post<MediaUploadResponse>("/media/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
