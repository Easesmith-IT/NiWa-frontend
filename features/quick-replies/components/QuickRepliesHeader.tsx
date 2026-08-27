import React from "react";

export const QuickRepliesHeader: React.FC = () => {
  return (
    <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#292C2F] dark:bg-[#121416]">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Quick Reply Library
      </h1>
      <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
        Slash commands and dynamic variable shortcuts for rapid customer conversation management.
      </p>
    </section>
  );
};
