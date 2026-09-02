import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { flowApi } from "./flow.api";
import { CrmFlow, FlowStatus } from "./flow.types";

export const FLOW_QUERY_KEYS = {
  flows: (status?: string) => ["crm", "flows", status ?? "all"],
  flow: (id: string) => ["crm", "flows", "detail", id],
  flowRuns: (flowId?: string, status?: string) => ["crm", "flow-runs", flowId ?? "all", status ?? "all"],
  flowRun: (runId: string) => ["crm", "flow-runs", "detail", runId],
};

export const useFlows = (status?: FlowStatus) => {
  return useQuery({
    queryKey: FLOW_QUERY_KEYS.flows(status),
    queryFn: () => flowApi.getFlows(status),
  });
};

export const useFlow = (id: string) => {
  return useQuery({
    queryKey: FLOW_QUERY_KEYS.flow(id),
    queryFn: () => flowApi.getFlowById(id),
    enabled: Boolean(id),
  });
};

export const useCreateFlow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CrmFlow>) => flowApi.createFlow(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm", "flows"] });
    },
  });
};

export const useUpdateFlow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CrmFlow> }) =>
      flowApi.updateFlow(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["crm", "flows"] });
      queryClient.invalidateQueries({ queryKey: FLOW_QUERY_KEYS.flow(variables.id) });
    },
  });
};

export const useActivateFlow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => flowApi.activateFlow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm", "flows"] });
    },
  });
};

export const usePauseFlow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => flowApi.pauseFlow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm", "flows"] });
    },
  });
};

export const useArchiveFlow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => flowApi.archiveFlow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm", "flows"] });
    },
  });
};

export const useFlowRuns = (flowId?: string, status?: string) => {
  return useQuery({
    queryKey: FLOW_QUERY_KEYS.flowRuns(flowId, status),
    queryFn: () => flowApi.getFlowRuns(flowId, status),
  });
};
