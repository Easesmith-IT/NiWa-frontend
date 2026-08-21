import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { v1QueryKeys } from "../../lib/api/v1-query-keys";
import { getTemplates, getTemplatesV1, GetTemplatesParams, syncTemplatesV1 } from "./templates.api";

export const templateKeys = {
  all: v1QueryKeys.templates,
  lists: () => [...v1QueryKeys.templates, "list"] as const,
  list: (params?: GetTemplatesParams) => [...templateKeys.lists(), params] as const,
};

export const useTemplatesV1Query = (params?: GetTemplatesParams) => {
  return useQuery({
    queryKey: templateKeys.list(params),
    queryFn: () => getTemplatesV1(params),
  });
};

export const useTemplates = () => {
  return useQuery({
    queryKey: templateKeys.lists(),
    queryFn: getTemplates,
  });
};

export const useSyncTemplatesV1Mutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncTemplatesV1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
    },
  });
};
