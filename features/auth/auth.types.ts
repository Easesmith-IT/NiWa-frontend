export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  token?: string;
  activeWorkspaceId?: string | null;
  activeMembership?: {
    workspaceId: string;
    role: string;
    status: string;
  } | null;
  operator?: {
    id: string;
    email: string;
    name: string;
    platformRole?: string;
  };
  user?: {
    id: string;
    email: string;
    name: string;
    platformRole?: string;
  };
}

export interface ProfileResponse {
  activeWorkspaceId?: string | null;
  activeMembership?: {
    workspaceId: string;
    role: string;
    status: string;
  } | null;
  operator?: {
    id: string;
    email: string;
    name: string;
    platformRole?: string;
  };
  user: {
    id: string;
    email: string;
    name: string;
    platformRole: string;
  };
}
