import React from "react";
import { Tag } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { ConversationsLabelsCardProps } from "../conversations.types";

export const ConversationsLabelsCard: React.FC<ConversationsLabelsCardProps> = ({
  draftLabels,
  labelInput,
  onLabelInputChange,
  onAddLabel,
  onRemoveLabel,
  onSaveLabels,
  isBusy,
  workspaceError,
  disabled,
}) => {
  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center justify-between gap-2 border-b border-[#F0F0F2] pb-2">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-[#176B4D]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">Labels & Tags</h3>
        </div>
        <Button
          disabled={disabled || isBusy}
          onClick={onSaveLabels}
          size="sm"
          type="button"
          variant="primary"
        >
          Save
        </Button>
      </div>
      {workspaceError ? <p className="text-xs text-[#C2413A]">{workspaceError}</p> : null}
      <div className="flex flex-wrap gap-1.5">
        {draftLabels.map((label) => (
          <span
            className="inline-flex items-center gap-1 rounded bg-[#EDF8F3] px-2 py-0.5 text-xs text-[#16803C] border border-[#C4E8DA]"
            key={label}
          >
            {label}
            <button className="text-[10px] font-bold" onClick={() => onRemoveLabel(label)} type="button">
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <Input
          onChange={(event) => onLabelInputChange(event.target.value)}
          placeholder="Add label..."
          value={labelInput}
        />
        <Button disabled={disabled} onClick={onAddLabel} size="sm" type="button" variant="secondary">
          Add
        </Button>
      </div>
    </Card>
  );
};
