"use client";

import React from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { MemoryFieldDefinition } from "../ai-agent.api";

export interface AgentMemoryModalProps {
  isOpen: boolean;
  editingMemoryKey: string | null;
  fieldName: string;
  fieldDesc: string;
  fieldType: MemoryFieldDefinition["type"];
  error: string | null;
  onFieldNameChange: (val: string) => void;
  onFieldDescChange: (val: string) => void;
  onFieldTypeChange: (val: MemoryFieldDefinition["type"]) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
  generateSafeKey: (name: string) => string;
}

export const AgentMemoryModal: React.FC<AgentMemoryModalProps> = ({
  isOpen,
  editingMemoryKey,
  fieldName,
  fieldDesc,
  fieldType,
  error,
  onFieldNameChange,
  onFieldDescChange,
  onFieldTypeChange,
  onSave,
  onClose,
  generateSafeKey,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={onSave} className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground">
            {editingMemoryKey ? "Edit Memory Field" : "Add Memory Field"}
          </h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ×
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded bg-destructive/10 text-destructive text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-foreground">Field Name</label>
            <Input
              value={fieldName}
              onChange={(e) => onFieldNameChange(e.target.value)}
              placeholder="e.g. Average Order Value"
            />
            <p className="text-[11px] text-muted-foreground">
              Internal key: <code className="font-mono font-bold text-primary">{editingMemoryKey || generateSafeKey(fieldName || "field_name")}</code>
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-foreground">Description</label>
            <Textarea
              rows={2}
              value={fieldDesc}
              onChange={(e) => onFieldDescChange(e.target.value)}
              placeholder="Explicit description of what this field tracks..."
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-foreground">Data Type</label>
            <select
              value={fieldType}
              onChange={(e) => onFieldTypeChange(e.target.value as MemoryFieldDefinition["type"])}
              className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="string">Text (String)</option>
              <option value="number">Number</option>
              <option value="boolean">Yes / No (Boolean)</option>
              <option value="string_array">List of Text (Array)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Save Memory Field
          </Button>
        </div>
      </form>
    </div>
  );
};
