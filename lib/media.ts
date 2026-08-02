import { MediaRecord } from "./api/types";

export const getMediaDisplayName = (media?: Pick<MediaRecord, "customName" | "fileName"> | null) =>
  media?.customName?.trim() || media?.fileName || "";
