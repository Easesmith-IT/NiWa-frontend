import React from "react";
import { FlowsList } from "features/crm/flows/components/FlowsList";

export const metadata = {
  title: "CRM Flows | NiWa",
  description: "Configure automated CRM flows and view execution history",
};

export default function CrmFlowsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <FlowsList />
    </div>
  );
}
