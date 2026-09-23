"use client";

import { TaxConfigurationView } from "../../../../features/finance";

export default function FinanceTaxesPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      <TaxConfigurationView />
    </div>
  );
}
