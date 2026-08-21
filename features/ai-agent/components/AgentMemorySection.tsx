"use client";

import React from "react";
import { ChevronDown, ChevronRight, Database, Edit2, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { cn } from "../../../lib/utils";
import { AgentMemorySectionProps } from "../ai-agent.types";

export const AgentMemorySection: React.FC<AgentMemorySectionProps> = ({
  currentData,
  showAdvancedMemory,
  onUpdateField,
  onOpenAddMemoryModal,
  onOpenEditMemoryModal,
  onDeleteMemoryField,
  onToggleShowAdvancedMemory,
}) => {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-3 gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            5. Conversation Memory Schema
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure facts worth remembering explicitly during customer chats with full provenance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">Memory:</span>
            <button
              onClick={() => onUpdateField("memoryEnabled", !currentData.memoryEnabled)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                currentData.memoryEnabled ? "bg-primary" : "bg-muted-foreground/30"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  currentData.memoryEnabled ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>

          <Button onClick={onOpenAddMemoryModal} size="sm" className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" /> Add Memory Field
          </Button>
        </div>
      </div>

      {/* Memory Fields Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
            <tr>
              <th className="p-3">Field Key</th>
              <th className="p-3">Description</th>
              <th className="p-3">Data Type</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(currentData.memorySchema || []).length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                  No memory fields configured. Click "Add Memory Field" to add one.
                </td>
              </tr>
            ) : (
              (currentData.memorySchema || []).map((item) => (
                <tr key={item.key} className="hover:bg-accent/30 transition-colors">
                  <td className="p-3 font-mono font-bold text-primary">{item.key}</td>
                  <td className="p-3 text-muted-foreground">{item.description || "No description"}</td>
                  <td className="p-3 font-semibold capitalize">{item.type.replace("_", " ")}</td>
                  <td className="p-3 text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenEditMemoryModal(item)}
                      className="h-7 w-7 p-0"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteMemoryField(item.key)}
                      className="h-7 w-7 p-0 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Advanced Collapsed Memory Settings */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onToggleShowAdvancedMemory}
          className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          {showAdvancedMemory ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Advanced Memory Bounds Settings
        </button>

        {showAdvancedMemory && (
          <div className="mt-3 p-4 rounded-lg border border-border bg-muted/20 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Max Facts Remembered Per Conversation</label>
              <Input
                type="number"
                min={1}
                max={50}
                value={currentData.maxFactsPerConversation || 15}
                onChange={(e) => onUpdateField("maxFactsPerConversation", Number(e.target.value))}
              />
              <p className="text-[11px] text-muted-foreground">Allowed limit: 1-50 facts (Default: 15)</p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Max Fact String Length</label>
              <Input
                type="number"
                min={20}
                max={500}
                value={currentData.maxFactLength || 200}
                onChange={(e) => onUpdateField("maxFactLength", Number(e.target.value))}
              />
              <p className="text-[11px] text-muted-foreground">Allowed limit: 20-500 characters (Default: 200)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
