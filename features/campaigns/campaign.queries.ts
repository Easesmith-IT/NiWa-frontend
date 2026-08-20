import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCampaign,
  deleteCampaign,
  getCampaignById,
  getCampaignRecipients,
  getCampaigns,
  updateCampaignStatus,
  validateCampaign,
} from "./campaign.api";
import { CreateCampaignPayload } from "./campaign.types";

export const campaignKeys = {
  all: ["campaigns"] as const,
  lists: () => [...campaignKeys.all, "list"] as const,
  details: () => [...campaignKeys.all, "detail"] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
  recipients: (id: string, params?: Record<string, unknown>) => [...campaignKeys.detail(id), "recipients", params] as const,
};

export const useCampaigns = () => {
  return useQuery({
    queryKey: campaignKeys.lists(),
    queryFn: getCampaigns,
  });
};

export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => getCampaignById(id),
    enabled: !!id,
  });
};

export const useCampaignRecipients = (
  id: string,
  params?: { page?: number; limit?: number; search?: string; status?: string }
) => {
  return useQuery({
    queryKey: campaignKeys.recipients(id, params),
    queryFn: () => getCampaignRecipients(id, params),
    enabled: !!id,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCampaignPayload) => createCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
};

export const useUpdateCampaignStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "pause" | "resume" | "cancel" }) =>
      updateCampaignStatus(id, action),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
};

export const useValidateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => validateCampaign(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(variables) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
};
