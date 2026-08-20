import { useQuery } from "@tanstack/react-query";
import { listMedia } from "./media.api";

export const mediaKeys = {
  all: ["media"] as const,
  lists: () => [...mediaKeys.all, "list"] as const,
};

export const useMedia = (enabled = true) => {
  return useQuery({
    queryKey: mediaKeys.lists(),
    queryFn: listMedia,
    enabled: enabled,
  });
};
