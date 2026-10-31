import React from "react";
import { Card } from "../../../components/ui/card";
import { MessageStudioHeader } from "./MessageStudioHeader";
import { ComposerMode } from "../message-studio.types";

export interface MessageStudioShellProps {
  mode: ComposerMode;
  onModeSelect: (mode: ComposerMode) => void;
  composerNode: React.ReactNode;
  previewNode: React.ReactNode;
}

export const MessageStudioShell: React.FC<MessageStudioShellProps> = ({
  mode,
  onModeSelect,
  composerNode,
  previewNode,
}) => {
  return (
    <div className="space-y-4">
      <MessageStudioHeader mode={mode} onModeSelect={onModeSelect} />

      <Card className="overflow-hidden p-0 shadow-subtle border border-[#E4E4E7] dark:border-[#292C2F]">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          {composerNode}
          {previewNode}
        </div>
      </Card>
    </div>
  );
};
