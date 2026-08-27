import React from "react";

export const MediaHeader: React.FC = () => {
  return (
    <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#292C2F] dark:bg-[#121416]">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Media Asset Vault
      </h1>
      <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
        Upload, manage, and reuse Meta Cloud API media attachments (Images, Documents, Audio, Video).
      </p>
    </section>
  );
};
