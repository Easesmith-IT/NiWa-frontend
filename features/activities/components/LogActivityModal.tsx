"use client";

import React, { useState } from "react";
import { X, Phone, Mail, Users, FileText, AlertCircle } from "lucide-react";
import { ActivityRecordType, ActivityType, CreateActivityPayload } from "../activity.types";
import { useCreateActivityMutation } from "../activity.queries";

interface LogActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRecordType: ActivityRecordType;
  targetRecordId: string;
}

const ACTIVITY_TYPES: { type: ActivityType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: "CALL", label: "Call", icon: Phone },
  { type: "EMAIL", label: "Email", icon: Mail },
  { type: "MEETING", label: "Meeting", icon: Users },
  { type: "NOTE", label: "Note", icon: FileText },
];

export const LogActivityModal: React.FC<LogActivityModalProps> = ({
  isOpen,
  onClose,
  targetRecordType,
  targetRecordId,
}) => {
  const [selectedType, setSelectedType] = useState<ActivityType>("CALL");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const createActivityMutation = useCreateActivityMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    const payload: CreateActivityPayload = {
      type: selectedType,
      subject: subject.trim(),
      description: description.trim(),
      relatedRecordType: targetRecordType,
      relatedRecordId: targetRecordId,
    };

    await createActivityMutation.mutateAsync(payload);
    setSubject("");
    setDescription("");
    onClose();
  };

  const isPending = createActivityMutation.isPending;
  const errorMsg = (createActivityMutation.error as Error)?.message;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Log Activity
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Activity Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ACTIVITY_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = selectedType === t.type;
                return (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => setSelectedType(t.type)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Intro discovery call with client"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes / Description
            </label>
            <textarea
              rows={3}
              placeholder="Add details, action items, outcomes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !subject.trim()}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Logging..." : "Log Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
