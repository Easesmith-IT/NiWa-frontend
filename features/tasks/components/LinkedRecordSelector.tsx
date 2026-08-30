"use client";

import React, { useState } from "react";
import { Plus, X, Link as LinkIcon, Building2, User, Target, TrendingUp, MessageSquare } from "lucide-react";
import { LinkedRecord, LinkedRecordType } from "../task.types";

interface LinkedRecordSelectorProps {
  value: LinkedRecord[];
  onChange: (records: LinkedRecord[]) => void;
}

const RECORD_TYPES: { type: LinkedRecordType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: "Person", label: "Person", icon: User },
  { type: "Company", label: "Company", icon: Building2 },
  { type: "Lead", label: "Lead", icon: Target },
  { type: "Deal", label: "Deal", icon: TrendingUp },
  { type: "Conversation", label: "Conversation", icon: MessageSquare },
];

export const LinkedRecordSelector: React.FC<LinkedRecordSelectorProps> = ({ value, onChange }) => {
  const [selectedType, setSelectedType] = useState<LinkedRecordType>("Person");
  const [recordIdInput, setRecordIdInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    setError(null);
    const trimmedId = recordIdInput.trim();
    if (!trimmedId) {
      setError("Please enter a record ID");
      return;
    }

    const exists = value.some((r) => r.recordType === selectedType && r.recordId === trimmedId);
    if (exists) {
      setError("Record is already linked");
      return;
    }

    onChange([...value, { recordType: selectedType, recordId: trimmedId }]);
    setRecordIdInput("");
  };

  const handleRemove = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Linked Records
      </label>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((rec, i) => {
            const config = RECORD_TYPES.find((t) => t.type === rec.recordType);
            const Icon = config?.icon || LinkIcon;
            return (
              <span
                key={`${rec.recordType}-${rec.recordId}-${i}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
              >
                <Icon className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold">{rec.recordType}:</span>
                <span className="font-mono text-slate-600 dark:text-slate-400">
                  {rec.recordId.length > 12 ? `${rec.recordId.slice(0, 10)}...` : rec.recordId}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="hover:text-red-500 transition-colors ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="flex gap-2">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as LinkedRecordType)}
          className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-900 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {RECORD_TYPES.map((t) => (
            <option key={t.type} value={t.type}>
              {t.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder={`Enter ${selectedType} ID...`}
          value={recordIdInput}
          onChange={(e) => {
            setRecordIdInput(e.target.value);
            setError(null);
          }}
          className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
        />

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Plus className="w-4 h-4" />
          Link
        </button>
      </div>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};
