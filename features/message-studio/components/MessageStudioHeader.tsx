import React from "react";
import { ComposerMode } from "../message-studio.types";
import { MessageModeSelector } from "./MessageModeSelector";

export interface MessageStudioHeaderProps {
  mode: ComposerMode;
  onModeSelect: (mode: ComposerMode) => void;
}

export const MessageStudioHeader: React.FC<MessageStudioHeaderProps> = ({
  mode,
  onModeSelect,
}) => {
  return (
    <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#292C2F] dark:bg-[#121416]">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Message Studio & Dispatch Workbench
      </h1>
      <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
        Compose, validate, preview, and send Meta Cloud API message payloads (Templates, Text, Interactive, Media).
      </p>
      <MessageModeSelector mode={mode} onModeSelect={onModeSelect} />
    </section>
  );
};
