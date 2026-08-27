import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/api/query-keys";
import {
  deleteMedia,
  getMediaDetail,
  listMedia,
  updateMediaMetadata,
  uploadMedia,
} from "./media.api";
import type {
  MediaDetailResponse,
  MediaListFilters,
  MediaListResponse,
  MediaUpdateMetadataPayload,
  MediaUploadPayload,
  MediaUploadResponse,
} from "./media.types";

export const mediaKeys = {
  all: queryKeys.media,
  lists: () => [...mediaKeys.all, "list"] as const,
  list: (filters: MediaListFilters) => [...mediaKeys.lists(), filters] as const,
  details: () => [...mediaKeys.all, "detail"] as const,
  detail: (id: string | null) => [...mediaKeys.details(), id] as const,
};

export const useMediaListQuery = (filters: MediaListFilters = {}) => {
  return useQuery<MediaListResponse>({
    queryKey: mediaKeys.list(filters),
    queryFn: () => listMedia(filters),
  });
};

export const useMediaDetailQuery = (id: string | null) => {
  return useQuery<MediaDetailResponse>({
    queryKey: mediaKeys.detail(id),
    queryFn: () => getMediaDetail(id!),
    enabled: Boolean(id),
  });
};

export const useUploadMediaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<MediaUploadResponse, Error, MediaUploadPayload>({
    mutationFn: (payload: MediaUploadPayload) => uploadMedia(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
    },
  });
};

export const useDeleteMediaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
    },
  });
};

export const useUpdateMediaMetadataMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<MediaDetailResponse, Error, MediaUpdateMetadataPayload>({
    mutationFn: (payload: MediaUpdateMetadataPayload) => updateMediaMetadata(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: mediaKeys.detail(variables.id) });
    },
  });
};

export const useMedia = (_enabled = true) => {
  return useMediaListQuery();
};
