"use client";

import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Plus, Shield, UserX, Edit2, AlertTriangle, UserCheck } from "lucide-react";
import React, { useState } from "react";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { getProfile } from "../../auth";
import { queryKeys } from "../../../lib/api/query-keys";
import { getActiveWorkspaceId } from "../../../lib/workspace/workspace-state";
import {
  useAddWorkspaceMember,
  useRemoveWorkspaceMember,
  useUpdateWorkspaceMember,
  useWorkspaceMembers,
} from "../workspace-members.queries";
import type {
  MembershipStatus,
  WorkspaceMemberItem,
  WorkspaceRole,
} from "../workspace-members.types";

export const WorkspaceMembersCard: React.FC = () => {
  const activeWorkspaceId = getActiveWorkspaceId();
  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
    retry: false,
  });

  const { data, isLoading, isError, error } = useWorkspaceMembers();
  const addMutation = useAddWorkspaceMember();
  const updateMutation = useUpdateWorkspaceMember();
  const removeMutation = useRemoveWorkspaceMember();

  // Modals / Dialog States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState<WorkspaceRole>("member");
  const [addError, setAddError] = useState<string | null>(null);

  const [editingMember, setEditingMember] = useState<WorkspaceMemberItem | null>(null);
  const [editRole, setEditRole] = useState<WorkspaceRole>("member");
  const [editStatus, setEditStatus] = useState<MembershipStatus>("active");
  const [editError, setEditError] = useState<string | null>(null);

  const [removingMember, setRemovingMember] = useState<WorkspaceMemberItem | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  // Derived current user & current workspace role
  const currentUserId = profileQuery.data?.user.id;
  const members = data?.members ?? [];
  const activeOwnerCount = members.filter(
    (m) => m.role === "owner" && m.status === "active",
  ).length;

  const currentMembership = members.find((m) => m.userId === currentUserId);
  const currentUserRole: WorkspaceRole =
    currentMembership?.role ||
    (profileQuery.data?.activeMembership?.workspaceId === activeWorkspaceId
      ? (profileQuery.data.activeMembership.role as WorkspaceRole)
      : "viewer");

  const canAddMembers = currentUserRole === "owner" || currentUserRole === "admin";

  const handleOpenAddModal = () => {
    setAddEmail("");
    setAddRole(currentUserRole === "owner" ? "member" : "member");
    setAddError(null);
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const cleanEmail = addEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setAddError("Please enter a valid email address");
      return;
    }

    if (addRole === "owner" && currentUserRole !== "owner") {
      setAddError("Only workspace owners can assign the owner role");
      return;
    }

    try {
      await addMutation.mutateAsync({ email: cleanEmail, role: addRole });
      setIsAddModalOpen(false);
    } catch (err) {
      if (err instanceof AxiosError) {
        setAddError(err.response?.data?.message || "Failed to add workspace member");
      } else if (err instanceof Error) {
        setAddError(err.message);
      } else {
        setAddError("An unexpected error occurred");
      }
    }
  };

  const handleOpenEditModal = (member: WorkspaceMemberItem) => {
    setEditingMember(member);
    setEditRole(member.role);
    setEditStatus(member.status);
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setEditError(null);

    if (editRole === "owner" && currentUserRole !== "owner") {
      setEditError("Only workspace owners can assign the owner role");
      return;
    }

    if (
      editingMember.role === "owner" &&
      (editRole !== "owner" || editStatus !== "active") &&
      activeOwnerCount <= 1
    ) {
      setEditError("Cannot demote or suspend the sole active owner of the workspace");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        memberUserId: editingMember.userId,
        payload: { role: editRole, status: editStatus },
      });
      setEditingMember(null);
    } catch (err) {
      if (err instanceof AxiosError) {
        setEditError(err.response?.data?.message || "Failed to update member");
      } else if (err instanceof Error) {
        setEditError(err.message);
      } else {
        setEditError("An unexpected error occurred");
      }
    }
  };

  const handleRemoveSubmit = async () => {
    if (!removingMember) return;
    setRemoveError(null);

    if (removingMember.role === "owner" && activeOwnerCount <= 1) {
      setRemoveError("Cannot remove the sole active owner of the workspace");
      return;
    }

    try {
      await removeMutation.mutateAsync(removingMember.userId);
      setRemovingMember(null);
    } catch (err) {
      if (err instanceof AxiosError) {
        setRemoveError(err.response?.data?.message || "Failed to remove member");
      } else if (err instanceof Error) {
        setRemoveError(err.message);
      } else {
        setRemoveError("An unexpected error occurred");
      }
    }
  };

  const canEditTargetMember = (target: WorkspaceMemberItem): boolean => {
    if (target.userId === currentUserId) return false; // No self-escalation / self-demotion
    if (currentUserRole === "owner") return true;
    if (currentUserRole === "admin") {
      return target.role !== "owner"; // Admins cannot edit owners
    }
    return false;
  };

  const canRemoveTargetMember = (target: WorkspaceMemberItem): boolean => {
    if (target.userId === currentUserId) return false; // Self removal disabled via management UI
    if (target.role === "owner" && activeOwnerCount <= 1) return false; // Sole owner protection
    if (currentUserRole === "owner") return true;
    if (currentUserRole === "admin") {
      return target.role !== "owner" && target.role !== "admin"; // Admins can remove members/viewers
    }
    return false;
  };

  const getRoleBadge = (role: WorkspaceRole) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "member":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "viewer":
      default:
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700";
    }
  };

  const getStatusBadge = (status: MembershipStatus) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";
      case "invited":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
      case "suspended":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400";
    }
  };

  return (
    <Card className="space-y-4 p-4">
      {/* Card Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#F0F0F2] pb-3 dark:border-[#202326]">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Workspace Team Members</h2>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Manage team member access and authorization roles for the current active workspace.
          </p>
        </div>
        {canAddMembers && (
          <Button size="sm" variant="primary" onClick={handleOpenAddModal}>
            <Plus className="h-3.5 w-3.5" />
            Add Member
          </Button>
        )}
      </div>

      {/* Workspace Context Check */}
      {!activeWorkspaceId ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          No active workspace selected. A valid workspace context is required to view or manage members.
        </div>
      ) : isLoading ? (
        <div className="py-8 text-center text-xs text-muted-foreground">Loading workspace members...</div>
      ) : isError ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {error instanceof AxiosError && error.response?.status === 403
            ? "Access Denied: You do not have permission to view workspace members."
            : error instanceof Error
              ? error.message
              : "Failed to load workspace members."}
        </div>
      ) : members.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground">
          No team members found in this workspace.
        </div>
      ) : (
        /* Members Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E4E4E7] text-muted-foreground dark:border-[#292C2F]">
                <th className="pb-2 font-medium">User</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Workspace Role</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F2] dark:divide-[#202326]">
              {members.map((member) => {
                const isCurrentUser = member.userId === currentUserId;
                const canEdit = canEditTargetMember(member);
                const canRemove = canRemoveTargetMember(member);

                return (
                  <tr key={member.id} className="group hover:bg-surface-secondary/50">
                    <td className="py-2.5 pr-2 font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        <span>{member.user?.name || "Workspace Member"}</span>
                        {isCurrentUser && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            (You)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 pr-2 font-mono text-muted-foreground">
                      {member.user?.email || "—"}
                    </td>
                    <td className="py-2.5 pr-2">
                      <span
                        className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold capitalize ${getRoleBadge(
                          member.role,
                        )}`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium capitalize ${getStatusBadge(
                          member.status,
                        )}`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => handleOpenEditModal(member)}
                            title="Edit Role or Status"
                          >
                            <Edit2 className="h-3 w-3" />
                            Edit
                          </Button>
                        )}
                        {canRemove && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400"
                            onClick={() => {
                              setRemovingMember(member);
                              setRemoveError(null);
                            }}
                            title="Remove Member"
                          >
                            <UserX className="h-3 w-3" />
                            Remove
                          </Button>
                        )}
                        {!canEdit && !canRemove && (
                          <span className="text-[10px] text-muted-foreground italic">Read-only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-background p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                Add Workspace Member
              </h3>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground text-xs"
                onClick={() => setIsAddModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-medium text-foreground">User Email Address</label>
                <Input
                  type="email"
                  placeholder="member@company.com"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  required
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  The user account must already exist on the NiWa platform.
                </p>
              </div>

              <div>
                <label className="mb-1 block font-medium text-foreground">Workspace Membership Role</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as WorkspaceRole)}
                >
                  {currentUserRole === "owner" && <option value="owner">Owner (Full Control & Admin Assignment)</option>}
                  <option value="admin">Admin (Manage Members & Settings)</option>
                  <option value="member">Member (Create & Manage Workspace Data)</option>
                  <option value="viewer">Viewer (Read-Only Access)</option>
                </select>
              </div>

              {addError && (
                <div className="rounded border border-rose-200 bg-rose-50 p-2 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                  {addError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={addMutation.isPending}
                >
                  {addMutation.isPending ? "Adding..." : "Add Member"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MEMBER MODAL */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-background p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-primary" />
                Update Member: {editingMember.user?.name || editingMember.user?.email}
              </h3>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground text-xs"
                onClick={() => setEditingMember(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-medium text-foreground">Workspace Role</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as WorkspaceRole)}
                >
                  {currentUserRole === "owner" && <option value="owner">Owner</option>}
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium text-foreground">Membership Status</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as MembershipStatus)}
                >
                  <option value="active">Active</option>
                  <option value="invited">Invited</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {editError && (
                <div className="rounded border border-rose-200 bg-rose-50 p-2 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                  {editError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingMember(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REMOVE MEMBER CONFIRMATION MODAL */}
      {removingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-background p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-sm font-semibold">Remove Workspace Member</h3>
            </div>

            <p className="text-xs text-muted-foreground">
              Are you sure you want to remove{" "}
              <strong className="text-foreground">
                {removingMember.user?.name || removingMember.user?.email}
              </strong>{" "}
              from this workspace? They will immediately lose access to all workspace data.
            </p>

            {removeError && (
              <div className="rounded border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                {removeError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setRemovingMember(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={removeMutation.isPending}
                onClick={handleRemoveSubmit}
              >
                {removeMutation.isPending ? "Removing..." : "Remove Member"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
