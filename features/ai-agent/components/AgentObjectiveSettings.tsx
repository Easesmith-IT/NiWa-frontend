"use client";

import React, { useState } from "react";
import { Target, Plus, X } from "lucide-react";
import { Textarea } from "../../../components/ui/textarea";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";

interface AgentObjectiveSettingsProps {
  primaryObjective: string;
  secondaryObjectives: string[];
  onChangePrimary: (val: string) => void;
  onChangeSecondary: (objs: string[]) => void;
}

export const AgentObjectiveSettings: React.FC<AgentObjectiveSettingsProps> = ({
  primaryObjective,
  secondaryObjectives,
  onChangePrimary,
  onChangeSecondary,
}) => {
  const [newSec, setNewSec] = useState("");

  const handleAddSecondary = () => {
    if (!newSec.trim()) return;
    if (!secondaryObjectives.includes(newSec.trim()) && secondaryObjectives.length < 10) {
      onChangeSecondary([...secondaryObjectives, newSec.trim()]);
    }
    setNewSec("");
  };

  const handleRemoveSecondary = (objToRemove: string) => {
    onChangeSecondary(secondaryObjectives.filter((s) => s !== objToRemove));
  };

  return (
    <div className="space-y-4">
      {/* Primary Objective */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Primary Objective (Max 1000 characters)
        </label>
        <Textarea
          value={primaryObjective}
          onChange={(e) => onChangePrimary(e.target.value)}
          placeholder="e.g. Move qualified prospects toward a relevant property and site visit."
          rows={3}
          maxLength={1000}
          className="text-xs"
        />
      </div>

      {/* Secondary Objectives */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Secondary Objectives (Max 10)
        </label>

        <div className="flex items-center gap-2">
          <Input
            value={newSec}
            onChange={(e) => setNewSec(e.target.value)}
            placeholder="e.g. qualify budget and preferred location"
            className="h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSecondary();
              }
            }}
          />
          <Button size="sm" variant="outline" onClick={handleAddSecondary} className="h-8 px-2.5">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {secondaryObjectives.length === 0 ? (
            <span className="text-xs text-slate-400 italic">No secondary objectives added.</span>
          ) : (
            secondaryObjectives.map((obj) => (
              <span
                key={obj}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 text-xs font-medium border border-slate-200 dark:border-slate-700"
              >
                {obj}
                <button
                  type="button"
                  onClick={() => handleRemoveSecondary(obj)}
                  className="hover:text-red-500"
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

