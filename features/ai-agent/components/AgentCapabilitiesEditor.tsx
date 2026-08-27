"use client";

import React, { useState } from "react";
import { Plus, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";

interface AgentCapabilitiesEditorProps {
  capabilities: string[];
  restrictedCapabilities: string[];
  onChangeCapabilities: (caps: string[]) => void;
  onChangeRestricted: (rests: string[]) => void;
}

export const AgentCapabilitiesEditor: React.FC<AgentCapabilitiesEditorProps> = ({
  capabilities,
  restrictedCapabilities,
  onChangeCapabilities,
  onChangeRestricted,
}) => {
  const [newCap, setNewCap] = useState("");
  const [newRest, setNewRest] = useState("");

  const handleAddCap = () => {
    if (!newCap.trim()) return;
    const formatted = newCap.trim().toLowerCase().replace(/\s+/g, "_");
    if (!capabilities.includes(formatted) && capabilities.length < 30) {
      onChangeCapabilities([...capabilities, formatted]);
    }
    setNewCap("");
  };

  const handleRemoveCap = (capToRemove: string) => {
    onChangeCapabilities(capabilities.filter((c) => c !== capToRemove));
  };

  const handleAddRest = () => {
    if (!newRest.trim()) return;
    const formatted = newRest.trim().toLowerCase().replace(/\s+/g, "_");
    if (!restrictedCapabilities.includes(formatted) && restrictedCapabilities.length < 30) {
      onChangeRestricted([...restrictedCapabilities, formatted]);
    }
    setNewRest("");
  };

  const handleRemoveRest = (restToRemove: string) => {
    onChangeRestricted(restrictedCapabilities.filter((r) => r !== restToRemove));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Allowed Capabilities */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">
              Allowed Capabilities ({capabilities.length}/30)
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={newCap}
            onChange={(e) => setNewCap(e.target.value)}
            placeholder="e.g. qualify_leads, schedule_visit"
            className="h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCap();
              }
            }}
          />
          <Button size="sm" variant="outline" onClick={handleAddCap} className="h-8 px-2.5">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5 min-h-[40px] pt-1">
          {capabilities.length === 0 ? (
            <span className="text-xs text-slate-400 italic">No explicit capabilities added.</span>
          ) : (
            capabilities.map((cap) => (
              <span
                key={cap}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 px-3 py-1 text-xs font-medium border border-emerald-200 dark:border-emerald-800"
              >
                {cap}
                <button
                  type="button"
                  onClick={() => handleRemoveCap(cap)}
                  className="hover:text-emerald-950 dark:hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Restricted Capabilities */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <ShieldAlert className="h-4 w-4 text-rose-500" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">
              Restricted Capabilities ({restrictedCapabilities.length}/30)
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={newRest}
            onChange={(e) => setNewRest(e.target.value)}
            placeholder="e.g. legal_advice, invent_prices"
            className="h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddRest();
              }
            }}
          />
          <Button size="sm" variant="outline" onClick={handleAddRest} className="h-8 px-2.5">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5 min-h-[40px] pt-1">
          {restrictedCapabilities.length === 0 ? (
            <span className="text-xs text-slate-400 italic">No restrictions configured.</span>
          ) : (
            restrictedCapabilities.map((rest) => (
              <span
                key={rest}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 px-3 py-1 text-xs font-medium border border-rose-200 dark:border-rose-800"
              >
                {rest}
                <button
                  type="button"
                  onClick={() => handleRemoveRest(rest)}
                  className="hover:text-rose-950 dark:hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

