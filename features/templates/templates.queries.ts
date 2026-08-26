import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/api/query-keys";
import { getTemplates, getTemplatesPaginated, GetTemplatesParams, syncTemplates } from "./templates.api";

export const templateKeys = {
  all: queryKeys.templates,
  lists: () => [...queryKeys.templates, "list"] as const,
  list: (params?: GetTemplatesParams) => [...templateKeys.lists(), params] as const,
};

export const useTemplatesPaginatedQuery = (params?: GetTemplatesParams) => {
  return useQuery({
    queryKey: templateKeys.list(params),
    queryFn: () => getTemplatesPaginated(params),
  });
};

export const useTemplates = () => {
  return useQuery({
    queryKey: templateKeys.lists(),
    queryFn: getTemplates,
  });
};

export const useSyncTemplatesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncTemplates,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
    },
  });
};
