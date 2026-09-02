"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import type { FlowActionType, FlowStep } from "../flow.types";
import { useWorkspaceMembers } from "../../../workspace-members/workspace-members.queries";

export interface FlowActionBuilderProps {
  steps: FlowStep[];
  onChange: (steps: FlowStep[]) => void;
  readOnly?: boolean;
}

export const ACTION_TYPE_LABELS: Record<FlowActionType, string> = {
  create_task: "Create Task",
  update_record: "Update Record",
  create_activity: "Create Activity",
  assign_owner: "Assign Owner",
  send_message: "Send Message",
  wait: "Wait",
};

export const FlowActionBuilder: React.FC<FlowActionBuilderProps> = ({
  steps,
  onChange,
  readOnly = false,
}) => {
  const { data: membersData } = useWorkspaceMembers();
  const members = membersData?.members || [];

  const handleAddStep = (type: FlowActionType) => {
    let defaultConfig: Record<string, unknown> = {};

    if (type === "create_task") {
      defaultConfig = { title: "Follow-up task", priority: "MEDIUM", dueInMinutes: 60 };
    } else if (type === "update_record") {
      defaultConfig = { targetEntity: "Lead", field: "status", value: "QUALIFIED" };
    } else if (type === "create_activity") {
      defaultConfig = { activityType: "NOTE", subject: "Automated Activity", description: "" };
    } else if (type === "assign_owner") {
      const firstMemberId = members[0]?.userId || members[0]?.user?._id || "";
      defaultConfig = { targetEntity: "Lead", ownerUserId: firstMemberId };
    } else if (type === "send_message") {
      defaultConfig = { body: "Hello {{ entity.name }}, thank you for your interest." };
    } else if (type === "wait") {
      defaultConfig = { delayMinutes: 5 };
    }

    onChange([...steps, { type, config: defaultConfig }]);
  };

  const handleRemoveStep = (index: number) => {
    onChange(steps.filter((_, i) => i !== index));
  };

  const handleUpdateStepConfig = (index: number, configPatch: Record<string, unknown>) => {
    const next = [...steps];
    next[index] = {
      ...next[index],
      config: {
        ...next[index].config,
        ...configPatch,
      },
    };
    onChange(next);
  };

  const renderStepConfig = (step: FlowStep, index: number) => {
    const config = step.config || {};

    // 1. Create Task Form
    if (step.type === "create_task") {
      return (
        <div className="grid gap-2 md:grid-cols-3">
          <div className="md:col-span-3">
            <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Task Title *</label>
            <input
              type="text"
              disabled={readOnly}
              value={String(config.title ?? "")}
              onChange={(e) => handleUpdateStepConfig(index, { title: e.target.value })}
              placeholder="e.g. Call client for follow-up"
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Due in Minutes</label>
            <input
              type="number"
              disabled={readOnly}
              value={Number(config.dueInMinutes ?? 60)}
              onChange={(e) => handleUpdateStepConfig(index, { dueInMinutes: Number(e.target.value || 0) })}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Priority</label>
            <select
              disabled={readOnly}
              value={String(config.priority ?? "MEDIUM")}
              onChange={(e) => handleUpdateStepConfig(index, { priority: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Description</label>
            <textarea
              rows={2}
              disabled={readOnly}
              value={String(config.description ?? "")}
              onChange={(e) => handleUpdateStepConfig(index, { description: e.target.value })}
              placeholder="Task details or context..."
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      );
    }

    // 2. Update Record Form (Restricted Targets)
    if (step.type === "update_record") {
      const targetEntity = String(config.targetEntity ?? "Lead");
      const field = String(config.field ?? "status");

      return (
        <div className="grid gap-2 md:grid-cols-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Target Record</label>
            <select
              disabled={readOnly}
              value={targetEntity}
              onChange={(e) => {
                const newTarget = e.target.value;
                const newField = newTarget === "Lead" ? "status" : newTarget === "Deal" ? "stage" : "customField";
                const newVal = newTarget === "Lead" ? "QUALIFIED" : "DISCOVERY";
                handleUpdateStepConfig(index, { targetEntity: newTarget, field: newField, value: newVal });
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="Lead">Lead</option>
              <option value="Deal">Deal</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Target Field</label>
            {targetEntity === "Lead" ? (
              <select
                disabled={readOnly}
                value={field}
                onChange={(e) => handleUpdateStepConfig(index, { field: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="status">status</option>
              </select>
            ) : targetEntity === "Deal" ? (
              <select
                disabled={readOnly}
                value={field}
                onChange={(e) => handleUpdateStepConfig(index, { field: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="stage">stage</option>
                <option value="stageId">stageId</option>
              </select>
            ) : (
              <input
                type="text"
                disabled={readOnly}
                value={field}
                onChange={(e) => handleUpdateStepConfig(index, { field: e.target.value })}
                placeholder="Field name"
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            )}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-0.5">New Value *</label>
            {targetEntity === "Lead" && field === "status" ? (
              <select
                disabled={readOnly}
                value={String(config.value ?? "QUALIFIED")}
                onChange={(e) => handleUpdateStepConfig(index, { value: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="QUALIFIED">QUALIFIED</option>
                <option value="UNQUALIFIED">UNQUALIFIED</option>
                <option value="CONVERTED">CONVERTED</option>
              </select>
            ) : (
              <input
                type="text"
                disabled={readOnly}
                value={String(config.value ?? "")}
                onChange={(e) => handleUpdateStepConfig(index, { value: e.target.value })}
                placeholder="Target value"
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            )}
          </div>
        </div>
      );
    }

    // 3. Create Activity Form
    if (step.type === "create_activity") {
      return (
        <div className="grid gap-2 md:grid-cols-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Activity Type</label>
            <select
              disabled={readOnly}
              value={String(config.activityType ?? "NOTE")}
              onChange={(e) => handleUpdateStepConfig(index, { activityType: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="NOTE">NOTE</option>
              <option value="CALL">CALL</option>
              <option value="MEETING">MEETING</option>
              <option value="EMAIL">EMAIL</option>
              <option value="TASK">TASK</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Subject</label>
            <input
              type="text"
              disabled={readOnly}
              value={String(config.subject ?? "")}
              onChange={(e) => handleUpdateStepConfig(index, { subject: e.target.value })}
              placeholder="e.g. Automated system note"
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Description / Content</label>
            <textarea
              rows={2}
              disabled={readOnly}
              value={String(config.description ?? "")}
              onChange={(e) => handleUpdateStepConfig(index, { description: e.target.value })}
              placeholder="Activity content..."
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      );
    }

    // 4. Assign Owner Form (P1-13)
    if (step.type === "assign_owner") {
      const selectedOwnerId = String(config.ownerUserId ?? "");
      const targetEntity = String(config.targetEntity ?? "Lead");

      return (
        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Target Entity</label>
            <select
              disabled={readOnly}
              value={targetEntity}
              onChange={(e) => handleUpdateStepConfig(index, { targetEntity: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="Lead">Lead</option>
              <option value="Deal">Deal</option>
              <option value="Person">Person</option>
              <option value="Company">Company</option>
              <option value="Task">Task</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Assigned Workspace Owner *</label>
            <select
              disabled={readOnly}
              value={selectedOwnerId}
              onChange={(e) => handleUpdateStepConfig(index, { ownerUserId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- Select Workspace User --</option>
              {members.map((m) => {
                const uId = m.userId || m.user?._id || m.id;
                const uName = m.user?.name || m.userId;
                const uEmail = m.user?.email ? ` (${m.user.email})` : "";
                return (
                  <option key={m.id || uId} value={uId}>
                    {uName}{uEmail} [{m.role}]
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      );
    }

    // 5. Send Message Form
    if (step.type === "send_message") {
      return (
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Message Body *</label>
          <textarea
            rows={3}
            disabled={readOnly}
            value={String(config.body ?? "")}
            onChange={(e) => handleUpdateStepConfig(index, { body: e.target.value })}
            placeholder="Message template (supports {{ entity.name }} placeholders)"
            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      );
    }

    // 6. Wait Form
    if (step.type === "wait") {
      return (
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Delay Duration (Minutes) *</label>
          <input
            type="number"
            disabled={readOnly}
            value={Number(config.delayMinutes ?? 5)}
            onChange={(e) => handleUpdateStepConfig(index, { delayMinutes: Number(e.target.value || 0) })}
            placeholder="5"
            className="w-full md:w-48 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Action Steps ({steps.length})
        </h4>
        {!readOnly && (
          <div className="flex flex-wrap items-center gap-1.5">
            {(["create_task", "update_record", "create_activity", "assign_owner", "send_message", "wait"] as const).map(
              (actType) => (
                <button
                  key={actType}
                  type="button"
                  onClick={() => handleAddStep(actType)}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded border border-slate-700 text-[11px] font-medium"
                >
                  <Plus className="w-3 h-3" />
                  {ACTION_TYPE_LABELS[actType]}
                </button>
              ),
            )}
          </div>
        )}
      </div>

      {steps.length === 0 ? (
        <div className="text-xs text-slate-500 italic p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-center">
          No action steps configured. Click one of the buttons above to add an action.
        </div>
      ) : (
        <div className="space-y-2.5">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-xs font-semibold text-emerald-400">
                  Step {idx + 1}: {ACTION_TYPE_LABELS[step.type] || step.type}
                </span>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="text-red-400 hover:text-red-300 p-1 text-xs"
                    title="Remove step"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {renderStepConfig(step, idx)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
