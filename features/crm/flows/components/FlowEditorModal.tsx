"use client";

import React, { useState } from "react";
import { useCreateFlow, useUpdateFlow } from "../flow.queries";
import { CrmFlow, FlowCondition, FlowStep, FlowTriggerType } from "../flow.types";

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

  const handleAddCondition = () => {
    setConditions([...conditions, { source: "entity.status", operator: "=", value: "" }]);
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleAddStep = (type: FlowStep["type"]) => {
    const defaultConfig =
      type === "create_task"
        ? { title: "Follow up task", priority: "MEDIUM" }
        : type === "create_activity"
        ? { description: "Flow activity note", activityType: "NOTE" }
        : type === "update_record"
        ? { field: "status", value: "QUALIFIED" }
        : type === "send_message"
        ? { body: "Hello {{ entity.title }}" }
        : type === "wait"
        ? { delayMinutes: 5 }
        : {};

    setSteps([...steps, { type, config: defaultConfig }]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

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
        { onSuccess: () => onClose() },
      );
    } else {
      createFlow.mutate(payload, { onSuccess: () => onClose() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-100">
              {flow ? "Edit Flow" : "Create New Flow"}
            </h2>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200">
              ✕
            </button>
          </div>

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
          <div className="space-y-3 border-t border-slate-800 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Conditions ({conditions.length})
              </h3>
              <button
                type="button"
                onClick={handleAddCondition}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                + Add Condition
              </button>
            </div>

            {conditions.map((cond, idx) => (
              <div key={idx} className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <input
                  type="text"
                  value={cond.source}
                  onChange={(e) => {
                    const next = [...conditions];
                    next[idx].source = e.target.value;
                    setConditions(next);
                  }}
                  placeholder="source (e.g. entity.status)"
                  className="w-1/3 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                />
                <select
                  value={cond.operator}
                  onChange={(e) => {
                    const next = [...conditions];
                    next[idx].operator = e.target.value as any;
                    setConditions(next);
                  }}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                >
                  <option value="=">=</option>
                  <option value="!=">!=</option>
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                  <option value=">=">&gt;=</option>
                  <option value="<=">&lt;=</option>
                  <option value="IN">IN</option>
                  <option value="NOT IN">NOT IN</option>
                  <option value="IS EMPTY">IS EMPTY</option>
                  <option value="IS NOT EMPTY">IS NOT EMPTY</option>
                  <option value="contains">contains</option>
                  <option value="exists">exists</option>
                </select>
                <input
                  type="text"
                  value={String(cond.value ?? "")}
                  onChange={(e) => {
                    const next = [...conditions];
                    next[idx].value = e.target.value;
                    setConditions(next);
                  }}
                  placeholder="value"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCondition(idx)}
                  className="text-red-400 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Step Configurator */}
          <div className="space-y-3 border-t border-slate-800 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Action Steps ({steps.length})
              </h3>
              <div className="flex items-center space-x-1.5 text-[11px]">
                {(["create_task", "create_activity", "update_record", "send_message", "wait"] as const).map(
                  (act) => (
                    <button
                      key={act}
                      type="button"
                      onClick={() => handleAddStep(act)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded border border-slate-700 font-medium"
                    >
                      + {act}
                    </button>
                  ),
                )}
              </div>
            </div>

            {steps.map((st, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span>
                    Step {idx + 1}: {st.type}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="text-red-400"
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  value={JSON.stringify(st.config, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      const next = [...steps];
                      next[idx].config = parsed;
                      setSteps(next);
                    } catch {}
                  }}
                  rows={2}
                  className="w-full font-mono text-[11px] bg-slate-900 border border-slate-800 rounded p-2 text-slate-300"
                />
              </div>
            ))}
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
              disabled={createFlow.isPending || updateFlow.isPending}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg shadow-sm"
            >
              {createFlow.isPending || updateFlow.isPending ? "Saving..." : "Save Flow"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
