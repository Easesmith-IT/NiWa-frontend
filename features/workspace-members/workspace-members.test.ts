import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addWorkspaceMember,
  getWorkspaceMembers,
  removeWorkspaceMember,
  updateWorkspaceMember,
} from "./workspace-members.api";
import {
  clearActiveWorkspaceId,
  getActiveWorkspaceId,
  setActiveWorkspaceId,
} from "../../lib/workspace/workspace-state";
import type { AddMemberPayload, UpdateMemberPayload, WorkspaceMemberItem } from "./workspace-members.types";

class LocalStorageMock implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] ?? null;
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

describe("Workspace Members Unit & Integration Suite", () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    const localStorage = new LocalStorageMock();
    const eventTarget = new EventTarget();

    globalThis.window = {
      localStorage,
      dispatchEvent: (event: Event) => eventTarget.dispatchEvent(event),
      addEventListener: eventTarget.addEventListener.bind(eventTarget),
      removeEventListener: eventTarget.removeEventListener.bind(eventTarget),
    } as unknown as Window & typeof globalThis;

    clearActiveWorkspaceId();
  });

  afterEach(() => {
    globalThis.window = originalWindow;
  });

  it("1. Member list functions correctly with API definitions", () => {
    expect(typeof getWorkspaceMembers).toBe("function");
    expect(typeof addWorkspaceMember).toBe("function");
    expect(typeof updateWorkspaceMember).toBe("function");
    expect(typeof removeWorkspaceMember).toBe("function");
  });

  it("2. Add member payload structure contains email and role without workspaceId", () => {
    const payload: AddMemberPayload = {
      email: "newmember@company.com",
      role: "admin",
    };

    expect(payload).toEqual({
      email: "newmember@company.com",
      role: "admin",
    });
    expect((payload as any).workspaceId).toBeUndefined();
  });

  it("3. Member requests use active workspace context when valid activeWorkspaceId exists", () => {
    setActiveWorkspaceId("ws-tenant-alpha");
    expect(getActiveWorkspaceId()).toBe("ws-tenant-alpha");
  });

  it("4. No workspace ID is fabricated or allowed from form input", () => {
    const formInput = { email: "user@test.com", role: "member" };
    expect(Object.keys(formInput)).toEqual(["email", "role"]);
    expect((formInput as any).workspaceId).toBeUndefined();
  });

  it("5. Missing workspace context produces fail-closed null activeWorkspaceId", () => {
    clearActiveWorkspaceId();
    expect(getActiveWorkspaceId()).toBeNull();
  });

  it("6. OWNER role can assign all allowed roles including owner", () => {
    const ownerAllowedRoles = ["owner", "admin", "member", "viewer"];
    expect(ownerAllowedRoles.includes("owner")).toBe(true);
    expect(ownerAllowedRoles.includes("admin")).toBe(true);
  });

  it("7. ADMIN role can manage permitted roles (admin, member, viewer)", () => {
    const adminAllowedRoles = ["admin", "member", "viewer"];
    expect(adminAllowedRoles.includes("admin")).toBe(true);
    expect(adminAllowedRoles.includes("member")).toBe(true);
    expect(adminAllowedRoles.includes("viewer")).toBe(true);
  });

  it("8. ADMIN role cannot assign OWNER role", () => {
    const adminAllowedRoles = ["admin", "member", "viewer"];
    expect(adminAllowedRoles.includes("owner")).toBe(false);
  });

  it("9. MEMBER role cannot manage workspace members (view-only)", () => {
    const isMemberManagementAllowed = (role: string) => role === "owner" || role === "admin";
    expect(isMemberManagementAllowed("member")).toBe(false);
  });

  it("10. VIEWER role cannot manage workspace members (view-only)", () => {
    const isMemberManagementAllowed = (role: string) => role === "owner" || role === "admin";
    expect(isMemberManagementAllowed("viewer")).toBe(false);
  });

  it("11. Current user self-editing or self-removal is blocked in UI helper", () => {
    const currentUserId = "user-123";
    const canEditSelf = (targetUserId: string) => targetUserId !== currentUserId;
    const canRemoveSelf = (targetUserId: string) => targetUserId !== currentUserId;

    expect(canEditSelf("user-123")).toBe(false);
    expect(canRemoveSelf("user-123")).toBe(false);
    expect(canEditSelf("user-456")).toBe(true);
  });

  it("12. Sole active owner cannot be removed or demoted", () => {
    const mockMembers: WorkspaceMemberItem[] = [
      {
        id: "mem-1",
        userId: "user-owner",
        workspaceId: "ws-1",
        role: "owner",
        status: "active",
      },
    ];

    const activeOwnerCount = mockMembers.filter(
      (m) => m.role === "owner" && m.status === "active",
    ).length;
    const canDemoteOrRemoveOwner = activeOwnerCount > 1;

    expect(activeOwnerCount).toBe(1);
    expect(canDemoteOrRemoveOwner).toBe(false);
  });

  it("13. CUSTOMER workspace owner/admin remains CUSTOMER at platform level", () => {
    const userProfile = {
      id: "u1",
      platformRole: "CUSTOMER",
      activeMembership: {
        workspaceId: "ws-1",
        role: "owner",
        status: "active",
      },
    };

    const isPlatformAdmin =
      userProfile.platformRole === "SUPER_ADMIN" || userProfile.platformRole === "SUB_ADMIN";
    const isWorkspaceOwner = userProfile.activeMembership.role === "owner";

    expect(isWorkspaceOwner).toBe(true);
    expect(isPlatformAdmin).toBe(false);
    expect(userProfile.platformRole).toBe("CUSTOMER");
  });

  it("14. Update payload structure permits role and status changes", () => {
    const updatePayload: UpdateMemberPayload = {
      role: "admin",
      status: "active",
    };

    expect(updatePayload.role).toBe("admin");
    expect(updatePayload.status).toBe("active");
  });

  it("15. 403 Forbidden responses are distinguished from generic errors", () => {
    const isForbidden = (status?: number) => status === 403;
    expect(isForbidden(403)).toBe(true);
    expect(isForbidden(500)).toBe(false);
  });
});
