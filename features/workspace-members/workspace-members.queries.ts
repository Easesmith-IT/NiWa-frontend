import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/api/query-keys";
import { getActiveWorkspaceId } from "../../lib/workspace/workspace-state";
import {
  addWorkspaceMember,
  getWorkspaceMembers,
  removeWorkspaceMember,
  updateWorkspaceMember,
} from "./workspace-members.api";
import type { AddMemberPayload, UpdateMemberPayload } from "./workspace-members.types";

export const useWorkspaceMembers = () => {
  const activeWorkspaceId = getActiveWorkspaceId();

  return useQuery({
    queryKey: [...queryKeys.workspaceMembers, activeWorkspaceId],
    queryFn: getWorkspaceMembers,
    enabled: Boolean(activeWorkspaceId),
    retry: false,
  });
};

export const useAddWorkspaceMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddMemberPayload) => addWorkspaceMember(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspaceMembers });
    },
  });
};

export const useUpdateWorkspaceMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberUserId, payload }: { memberUserId: string; payload: UpdateMemberPayload }) =>
      updateWorkspaceMember(memberUserId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspaceMembers });
    },
  });
};

export const useRemoveWorkspaceMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberUserId: string) => removeWorkspaceMember(memberUserId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspaceMembers });
    },
  });
};
