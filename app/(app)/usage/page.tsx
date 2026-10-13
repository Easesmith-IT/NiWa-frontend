import { Metadata } from "next";
import { WhatsAppUsageAdminView } from "../../../features/whatsapp-billing";

export const metadata: Metadata = {
  title: "WhatsApp Usage & Billing | NIWA",
  description: "Real-time usage pricing, immutable financial ledger, and atomic allowance accounting.",
};

export default function WorkspaceUsagePage() {
  return (
    <div className="space-y-6">
      <WhatsAppUsageAdminView />
    </div>
  );
}
