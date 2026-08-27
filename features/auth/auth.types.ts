export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  token?: string;
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
