"use client";

import {
  MetaCredentialsCard,
  OperatorProfileCard,
  SecurityCredentialsCard,
  SettingsHeader,
  useSettingsOrchestration,
} from "../../../features/settings";
import { WhatsAppSettingsModule } from "../../../features/whatsapp-connections/WhatsAppSettingsModule";
import { WorkspaceMembersCard } from "../../../features/workspace-members";

export default function SettingsPage() {
  const { profile, security, meta } = useSettingsOrchestration();

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <SettingsHeader />

      {/* Workspace Team Member Management Card */}
      <WorkspaceMembersCard />

      {/* WhatsApp Embedded Signup & Connections Module */}
      <WhatsAppSettingsModule />

      {/* Operator Profile & Security Credentials Cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        <OperatorProfileCard profile={profile} />
        <SecurityCredentialsCard security={security} />
      </div>

      {/* Meta WABA Credentials Card */}
      <MetaCredentialsCard meta={meta} />
    </div>
  );
}
