const ACTIVE_WORKSPACE_ID_KEY = "activeWorkspaceId";

const INVALID_WORKSPACE_IDS = new Set([
  "ws-default",
  "ws_default",
  "default",
  "undefined",
  "null",
]);

export const isValidWorkspaceId = (id: unknown): id is string => {
  if (typeof id !== "string") return false;
  const trimmed = id.trim();
  if (!trimmed) return false;
  if (INVALID_WORKSPACE_IDS.has(trimmed.toLowerCase())) return false;
  if (
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_WORKSPACE_ID &&
    trimmed !== process.env.NEXT_PUBLIC_WORKSPACE_ID
  ) {
    return false;
  }
  return true;
};

export const getActiveWorkspaceId = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(ACTIVE_WORKSPACE_ID_KEY);
  if (!stored || !isValidWorkspaceId(stored)) {
    if (stored) {
      window.localStorage.removeItem(ACTIVE_WORKSPACE_ID_KEY);
    }
    return null;
  }

  return stored.trim();
};

export const setActiveWorkspaceId = (id: string | null): void => {
  if (typeof window === "undefined") {
    return;
  }

  const previousId = getActiveWorkspaceId();
  const nextId = id && isValidWorkspaceId(id) ? id.trim() : null;

  if (nextId) {
    window.localStorage.setItem(ACTIVE_WORKSPACE_ID_KEY, nextId);
  } else {
    window.localStorage.removeItem(ACTIVE_WORKSPACE_ID_KEY);
  }

  if (previousId !== nextId) {
    window.dispatchEvent(
      new CustomEvent("niwa:workspace-changed", {
        detail: { workspaceId: nextId },
      }),
    );
  }
};

export const clearActiveWorkspaceId = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACTIVE_WORKSPACE_ID_KEY);
  window.dispatchEvent(
    new CustomEvent("niwa:workspace-changed", {
      detail: { workspaceId: null },
    }),
  );
};
