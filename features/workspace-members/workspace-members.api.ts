import { apiClient } from "../../lib/api/api-client";
import type {
  AddMemberPayload,
  GetMembersResponse,
  UpdateMemberPayload,
  WorkspaceMemberItem,
} from "./workspace-members.types";

export const getWorkspaceMembers = async (): Promise<GetMembersResponse> => {
  const { data } = await apiClient.get<GetMembersResponse>("/workspace/members");
  return data;
};

export const addWorkspaceMember = async (
  payload: AddMemberPayload,
): Promise<{ member: WorkspaceMemberItem }> => {
  const { data } = await apiClient.post<{ member: WorkspaceMemberItem }>(
    "/workspace/members",
    payload,
  );
  return data;
};

export const updateWorkspaceMember = async (
  memberUserId: string,
  payload: UpdateMemberPayload,
): Promise<{ member: WorkspaceMemberItem }> => {
  const { data } = await apiClient.patch<{ member: WorkspaceMemberItem }>(
    `/workspace/members/${memberUserId}`,
    payload,
  );
  return data;
};

export const removeWorkspaceMember = async (
  memberUserId: string,
): Promise<{ success: boolean; removedUserId: string }> => {
  const { data } = await apiClient.delete<{ success: boolean; removedUserId: string }>(
    `/workspace/members/${memberUserId}`,
  );
  return data;
};
