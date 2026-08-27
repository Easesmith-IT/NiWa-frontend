import React from "react";

export const SettingsHeader: React.FC = () => {
  return (
    <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#292C2F] dark:bg-[#121416]">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        System Settings & Meta Cloud API Connectivity
      </h1>
      <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
        Configure WABA credentials, phone number IDs, Meta Embedded Signup connections, and operator access controls.
      </p>
    </section>
  );
};
