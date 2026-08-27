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

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <Card className="overflow-hidden p-0">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            {composerNode}
            {previewNode}
          </div>
        </Card>
      </div>
    </div>
  );
};
