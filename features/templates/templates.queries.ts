import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTemplates, getTemplatesV1, GetTemplatesParams, syncTemplatesV1 } from "./templates.api";

export const templateKeys = {
  all: ["templates"] as const,
  lists: () => [...templateKeys.all, "list"] as const,
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
