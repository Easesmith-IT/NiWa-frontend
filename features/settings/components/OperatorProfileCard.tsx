import React from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import type { useOperatorProfileState } from "../hooks/useOperatorProfileState";

export interface OperatorProfileCardProps {
  profile: ReturnType<typeof useOperatorProfileState>;
}

export const OperatorProfileCard: React.FC<OperatorProfileCardProps> = ({ profile }) => {
  return (
    <Card className="space-y-3.5 p-4">
      <div className="border-b border-[#F0F0F2] pb-2.5 dark:border-[#202326]">
        <h2 className="text-sm font-semibold text-foreground">Operator Profile</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Manage operator identity attached to active sessions and audit logs.
        </p>
      </div>
      <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 text-xs space-y-1 dark:border-[#292C2F] dark:bg-[#17191B]">
        <p className="text-muted-foreground">
          Email:{" "}
          <span className="font-mono font-medium text-foreground">
            {profile.profileQuery.data?.user.email ?? "Loading..."}
          </span>
        </p>
        <p className="text-muted-foreground">
          Role:{" "}
          <span className="font-semibold text-foreground capitalize">
            {profile.profileQuery.data?.user.platformRole ?? "..."}
          </span>
        </p>
      </div>
      <form className="space-y-3" onSubmit={profile.handleProfileSubmit}>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Operator Display Name</label>
          <Input placeholder="Operator name" {...profile.profileForm.register("name")} />
        </div>
        <Button disabled={profile.profileMutation.isPending} type="submit" variant="primary">
          {profile.profileMutation.isPending ? "Saving..." : "Update Profile"}
        </Button>
        {profile.profileMessage ? (
          <p className="text-xs font-medium text-[#16803C] dark:text-[#3FA66F]">{profile.profileMessage}</p>
        ) : null}
        {profile.profileError ? (
          <p className="text-xs font-medium text-[#C2413A] dark:text-[#D7685C]">{profile.profileError}</p>
        ) : null}
      </form>
    </Card>
  );
};
