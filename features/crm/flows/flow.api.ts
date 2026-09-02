import { apiClient } from "lib/api/api-client";
import { CrmFlow, CrmFlowRun, FlowStatus } from "./flow.types";

export const flowApi = {
  getFlows: async (status?: FlowStatus): Promise<{ data: CrmFlow[]; count: number }> => {
    const response = await apiClient.get("/crm/flows", { params: { status } });
    return response.data;
  },

  getFlowById: async (id: string): Promise<{ data: CrmFlow }> => {
    const response = await apiClient.get(`/crm/flows/${id}`);
    return response.data;
  },

  createFlow: async (payload: Partial<CrmFlow>): Promise<{ data: CrmFlow }> => {
    const response = await apiClient.post("/crm/flows", payload);
    return response.data;
  },

  updateFlow: async (id: string, payload: Partial<CrmFlow>): Promise<{ data: CrmFlow }> => {
    const response = await apiClient.patch(`/crm/flows/${id}`, payload);
    return response.data;
  },

  activateFlow: async (id: string): Promise<{ data: CrmFlow }> => {
    const response = await apiClient.post(`/crm/flows/${id}/activate`);
    return response.data;
  },

  pauseFlow: async (id: string): Promise<{ data: CrmFlow }> => {
    const response = await apiClient.post(`/crm/flows/${id}/pause`);
    return response.data;
  },

  archiveFlow: async (id: string): Promise<{ data: CrmFlow }> => {
    const response = await apiClient.delete(`/crm/flows/${id}`);
    return response.data;
  },

  getFlowRuns: async (flowId?: string, status?: string): Promise<{ data: CrmFlowRun[]; count: number }> => {
    const url = flowId ? `/crm/flows/${flowId}/runs` : "/crm/flows/runs/all";
    const response = await apiClient.get(url, { params: { status } });
    return response.data;
  },

  getFlowRunById: async (runId: string): Promise<{ data: CrmFlowRun }> => {
    const response = await apiClient.get(`/crm/flow-runs/${runId}`);
    return response.data;
  },
};
