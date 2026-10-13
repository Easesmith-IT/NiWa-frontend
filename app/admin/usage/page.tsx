import { Metadata } from "next";
import { WhatsAppUsageAdminView } from "../../../features/whatsapp-billing";

export const metadata: Metadata = {
  title: "WhatsApp Usage & Billing | Admin Console",
  description: "Real-time usage pricing, immutable financial ledger, and atomic allowance accounting.",
};

export default function AdminUsagePage() {
  return (
    <div className="space-y-6">
      <WhatsAppUsageAdminView />
    </div>
  );
}
