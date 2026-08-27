"use client";

import { useQueryClient } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  clearActiveWorkspaceId,
  getActiveWorkspaceId,
  setActiveWorkspaceId,
} from "./workspace-state";

export interface ActiveMembershipState {
  workspaceId: string;
  role: string;
  status: string;
}

export interface WorkspaceUserContext {
  id: string;
  email: string;
  name: string;
  platformRole: string;
}

interface WorkspaceContextType {
  activeWorkspaceId: string | null;
  activeMembership: ActiveMembershipState | null;
  user: WorkspaceUserContext | null;
  setActiveWorkspace: (
    id: string | null,
    membership?: ActiveMembershipState | null,
    user?: WorkspaceUserContext | null,
  ) => void;
  setWorkspaceContext: (context: {
    activeWorkspaceId?: string | null;
    activeMembership?: ActiveMembershipState | null;
    user?: WorkspaceUserContext | null;
  }) => void;
  clearWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(() => getActiveWorkspaceId());
  const [activeMembership, setActiveMembershipState] = useState<ActiveMembershipState | null>(null);
  const [user, setUserState] = useState<WorkspaceUserContext | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleWorkspaceChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{
        workspaceId: string | null;
        membership?: ActiveMembershipState | null;
        user?: WorkspaceUserContext | null;
      }>;
      const nextId = customEvent.detail?.workspaceId ?? getActiveWorkspaceId();
      setActiveWorkspaceIdState(nextId);

      if (customEvent.detail?.membership !== undefined) {
        setActiveMembershipState(customEvent.detail.membership);
      }
      if (customEvent.detail?.user !== undefined) {
        setUserState(customEvent.detail.user);
      }

      // Clear React Query cache so Workspace A data never leaks into Workspace B
      queryClient.clear();
    };

    window.addEventListener("niwa:workspace-changed", handleWorkspaceChanged);
    return () => {
      window.removeEventListener("niwa:workspace-changed", handleWorkspaceChanged);
    };
  }, [queryClient]);

  const handleSetWorkspaceContext = (context: {
    activeWorkspaceId?: string | null;
    activeMembership?: ActiveMembershipState | null;
    user?: WorkspaceUserContext | null;
  }) => {
    if (context.activeWorkspaceId !== undefined) {
      setActiveWorkspaceId(context.activeWorkspaceId);
      setActiveWorkspaceIdState(getActiveWorkspaceId());
    }
    if (context.activeMembership !== undefined) {
      setActiveMembershipState(context.activeMembership);
    }
    if (context.user !== undefined) {
      setUserState(context.user);
    }
  };

  const handleSetActiveWorkspace = (
    id: string | null,
    membership: ActiveMembershipState | null = null,
    userData: WorkspaceUserContext | null = null,
  ) => {
    setActiveWorkspaceId(id);
    setActiveWorkspaceIdState(getActiveWorkspaceId());
    setActiveMembershipState(membership);
    setUserState(userData);
    queryClient.clear();
  };

  const handleClearWorkspace = () => {
    clearActiveWorkspaceId();
    setActiveWorkspaceIdState(null);
    setActiveMembershipState(null);
    setUserState(null);
    queryClient.clear();
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeWorkspaceId,
        activeMembership,
        user,
        setActiveWorkspace: handleSetActiveWorkspace,
        setWorkspaceContext: handleSetWorkspaceContext,
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
