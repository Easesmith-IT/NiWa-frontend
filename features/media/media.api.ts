import { v1ApiClient } from "../../lib/api/v1-client";

export interface MediaRecord {
  _id?: string;
  customName?: string | null;
  fileName: string;
  metaMediaId: string;
  mimeType: string;
  mediaType: string;
}

export const listMedia = async () => {
  const { data } = await v1ApiClient.get<{ media: MediaRecord[] }>("/media");
  return data;
};
