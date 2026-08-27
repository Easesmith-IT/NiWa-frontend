import React from "react";

export const WebhooksHeader: React.FC = () => {
  return (
    <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#292C2F] dark:bg-[#121416]">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Webhook Verification & Live Stream
      </h1>
      <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
        Diagnose Meta webhook subscriptions, verify handshake URLs, and inspect real-time payload delivery.
      </p>
    </section>
  );
};
