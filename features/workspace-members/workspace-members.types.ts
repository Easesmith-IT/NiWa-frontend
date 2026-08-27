export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";
export type MembershipStatus = "active" | "invited" | "suspended";

export interface WorkspaceMemberUser {
  _id?: string;
  email: string;
  name: string;
  platformRole: string;
  isActive: boolean;
}

export interface WorkspaceMemberItem {
  id: string;
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  status: MembershipStatus;
  invitedBy?: string | null;
  joinedAt?: string;
  user?: WorkspaceMemberUser | null;
}

export interface GetMembersResponse {
  members: WorkspaceMemberItem[];
  count: number;
}

export interface AddMemberPayload {
  email: string;
  role: WorkspaceRole;
}

export interface UpdateMemberPayload {
  role?: WorkspaceRole;
  status?: MembershipStatus;
}
