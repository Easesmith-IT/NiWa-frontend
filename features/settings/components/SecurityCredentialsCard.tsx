import React from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import type { useSecuritySettingsState } from "../hooks/useSecuritySettingsState";

export interface SecurityCredentialsCardProps {
  security: ReturnType<typeof useSecuritySettingsState>;
}

export const SecurityCredentialsCard: React.FC<SecurityCredentialsCardProps> = ({ security }) => {
  return (
    <Card className="space-y-3.5 p-4">
      <div className="border-b border-[#F0F0F2] pb-2.5 dark:border-[#202326]">
        <h2 className="text-sm font-semibold text-foreground">Security & Credentials</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Change account password and refresh security tokens.
        </p>
      </div>
      <form className="space-y-3" onSubmit={security.handlePasswordSubmit}>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Current Password</label>
          <Input
            placeholder="Current password"
            type="password"
            {...security.passwordForm.register("currentPassword")}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">New Password</label>
          <Input
            placeholder="New password"
            type="password"
            {...security.passwordForm.register("newPassword")}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Confirm New Password</label>
          <Input
            placeholder="Confirm new password"
            type="password"
            {...security.passwordForm.register("confirmPassword")}
          />
        </div>
        <Button disabled={security.passwordMutation.isPending} type="submit" variant="secondary">
          {security.passwordMutation.isPending ? "Updating..." : "Change Password"}
        </Button>
        {security.passwordMessage ? (
          <p className="text-xs font-medium text-[#16803C] dark:text-[#3FA66F]">{security.passwordMessage}</p>
        ) : null}
        {security.passwordError ? (
          <p className="text-xs font-medium text-[#C2413A] dark:text-[#D7685C]">{security.passwordError}</p>
        ) : null}
      </form>
    </Card>
  );
};
