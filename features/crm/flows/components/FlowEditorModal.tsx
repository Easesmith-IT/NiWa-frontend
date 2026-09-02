"use client";

import React, { useState } from "react";
import { useCreateFlow, useUpdateFlow } from "../flow.queries";
import { CrmFlow, FlowCondition, FlowStep, FlowTriggerType } from "../flow.types";
import { FlowConditionBuilder } from "./FlowConditionBuilder";
import { FlowActionBuilder } from "./FlowActionBuilder";

interface FlowEditorModalProps {
  flow: CrmFlow | null;
  onClose: () => void;
}

const TRIGGER_OPTIONS: { label: string; value: FlowTriggerType }[] = [
  { label: "Lead Created", value: "lead.created" },
  { label: "Lead Status Changed", value: "lead.status_changed" },
  { label: "Deal Created", value: "deal.created" },
  { label: "Deal Stage Changed", value: "deal.stage_changed" },
  { label: "Deal Won", value: "deal.won" },
  { label: "Deal Lost", value: "deal.lost" },
  { label: "Custom Field Changed", value: "field_value.changed" },
  { label: "Task Due", value: "task.due" },
  { label: "Incoming Message", value: "incoming_message" },
  { label: "Manual Test", value: "manual" },
];

export const FlowEditorModal: React.FC<FlowEditorModalProps> = ({ flow, onClose }) => {
  const createFlow = useCreateFlow();
  const updateFlow = useUpdateFlow();

  const [name, setName] = useState(flow?.name || "");
  const [description, setDescription] = useState(flow?.description || "");
  const [triggerType, setTriggerType] = useState<FlowTriggerType>(flow?.trigger?.type || "lead.created");
  const [conditions, setConditions] = useState<FlowCondition[]>(flow?.conditions || []);
  const [steps, setSteps] = useState<FlowStep[]>(flow?.steps || []);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!name.trim()) {
      setErrorMessage("Flow name is required.");
      return;
    }

    const payload = {
      name,
      description: description || null,
      trigger: { type: triggerType },
      conditions,
      steps,
    };

    if (flow) {
      updateFlow.mutate(
        { id: flow._id, payload },
        {
          onSuccess: () => onClose(),
          onError: (err: any) => {
            const msg = err?.response?.status === 403
              ? "Permission Denied (403): You do not have write access to modify CRM Flows."
              : err?.response?.data?.message || err?.message || "Failed to update flow.";
            setErrorMessage(msg);
          },
        },
      );
    } else {
      createFlow.mutate(payload, {
        onSuccess: () => onClose(),
        onError: (err: any) => {
          const msg = err?.response?.status === 403
            ? "Permission Denied (403): You do not have write access to create CRM Flows."
            : err?.response?.data?.message || err?.message || "Failed to create flow.";
          setErrorMessage(msg);
        },
      });
    }
  };

  const isPending = createFlow.isPending || updateFlow.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-100">
              {flow ? "Edit Flow" : "Create New Flow"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 text-sm font-semibold"
            >
              ✕
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-950/80 border border-red-800/80 rounded-lg text-red-200 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Basic Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Flow Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Auto-assign high value deals"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Brief summary of what this flow automates..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Trigger Event *</label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value as FlowTriggerType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {TRIGGER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({opt.value})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition Builder */}
          <div className="border-t border-slate-800 pt-4">
            <FlowConditionBuilder conditions={conditions} onChange={setConditions} />
          </div>

          {/* Action Builder */}
          <div className="border-t border-slate-800 pt-4">
            <FlowActionBuilder steps={steps} onChange={setSteps} />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg shadow-sm disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Flow"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
