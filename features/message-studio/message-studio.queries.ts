import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { v1QueryKeys } from "../../lib/api/v1-query-keys";
import {
  getMessageStudioMedia,
  getMessageStudioTemplates,
  sendMessage,
  uploadTemplateHeaderMedia,
} from "./message-studio.api";
import type { SendMessageRequest, TemplateHeaderUploadRequest } from "./message-studio.types";

export const messageStudioKeys = {
  all: v1QueryKeys.messageStudio,
  templates: () => [...messageStudioKeys.all, "templates"] as const,
  media: () => [...messageStudioKeys.all, "media"] as const,
};

export const useMessageStudioTemplates = () => {
  return useQuery({
    queryKey: messageStudioKeys.templates(),
    queryFn: getMessageStudioTemplates,
  });
};

export const useMessageStudioMedia = () => {
  return useQuery({
    queryKey: messageStudioKeys.media(),
    queryFn: getMessageStudioMedia,
  });
};

export const useSendMessageMutation = () => {
  return useMutation({
    mutationFn: (request: SendMessageRequest) => sendMessage(request),
  });
};

export const useTemplateHeaderUploadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: TemplateHeaderUploadRequest) => uploadTemplateHeaderMedia(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: messageStudioKeys.media() });
    },
  });
};
