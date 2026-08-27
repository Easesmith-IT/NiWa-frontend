"use client";

import { useQueryClient } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  clearActiveWorkspaceId,
  getActiveWorkspaceId,
  setActiveWorkspaceId,
} from "./workspace-state";

interface WorkspaceContextType {
  activeWorkspaceId: string | null;
  setActiveWorkspace: (id: string | null) => void;
  clearWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(() => getActiveWorkspaceId());
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleWorkspaceChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ workspaceId: string | null }>;
      const nextId = customEvent.detail?.workspaceId ?? getActiveWorkspaceId();
      setActiveWorkspaceIdState(nextId);
      // Clear React Query cache so Workspace A data never leaks into Workspace B
      queryClient.clear();
    };

    window.addEventListener("niwa:workspace-changed", handleWorkspaceChanged);
    return () => {
      window.removeEventListener("niwa:workspace-changed", handleWorkspaceChanged);
    };
  }, [queryClient]);

  const handleSetActiveWorkspace = (id: string | null) => {
    setActiveWorkspaceId(id);
    setActiveWorkspaceIdState(getActiveWorkspaceId());
    queryClient.clear();
  };

  const handleClearWorkspace = () => {
    clearActiveWorkspaceId();
    setActiveWorkspaceIdState(null);
    queryClient.clear();
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeWorkspaceId,
        setActiveWorkspace: handleSetActiveWorkspace,
        clearWorkspace: handleClearWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
