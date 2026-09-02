"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import type { FlowCondition, FlowOperator } from "../flow.types";

export type FieldDataType = "string" | "number" | "boolean" | "date" | "option";

export interface AllowlistedSource {
  value: string;
  label: string;
  category: "Lead" | "Deal" | "Person" | "Company" | "Task" | "Activity" | "Relationship" | "Custom";
  type: FieldDataType;
  options?: string[];
}

export const ALLOWLISTED_SOURCES: AllowlistedSource[] = [
  // Lead
  { value: "entity.status", label: "Lead: Status", category: "Lead", type: "option", options: ["NEW", "CONTACTED", "QUALIFIED", "UNQUALIFIED", "CONVERTED"] },
  { value: "entity.source", label: "Lead: Source", category: "Lead", type: "string" },
  { value: "entity.score", label: "Lead: Score", category: "Lead", type: "number" },
  { value: "entity.title", label: "Lead: Title", category: "Lead", type: "string" },
  { value: "entity.name", label: "Lead: Name", category: "Lead", type: "string" },
  { value: "entity.email", label: "Lead: Email", category: "Lead", type: "string" },
  { value: "entity.phone", label: "Lead: Phone", category: "Lead", type: "string" },
  { value: "entity.companyName", label: "Lead: Company Name", category: "Lead", type: "string" },
  { value: "entity.value", label: "Lead: Value", category: "Lead", type: "number" },
  { value: "entity.ownerUserId", label: "Lead: Owner User ID", category: "Lead", type: "string" },
  { value: "entity.createdAt", label: "Lead: Created At", category: "Lead", type: "date" },
  { value: "entity.updatedAt", label: "Lead: Updated At", category: "Lead", type: "date" },

  // Deal
  { value: "entity.stage", label: "Deal: Stage", category: "Deal", type: "option" },
  { value: "entity.stageId", label: "Deal: Stage ID", category: "Deal", type: "string" },
  { value: "entity.value", label: "Deal: Value", category: "Deal", type: "number" },
  { value: "entity.title", label: "Deal: Title", category: "Deal", type: "string" },
  { value: "entity.name", label: "Deal: Name", category: "Deal", type: "string" },
  { value: "entity.pipelineId", label: "Deal: Pipeline ID", category: "Deal", type: "string" },
  { value: "entity.probability", label: "Deal: Probability", category: "Deal", type: "number" },
  { value: "entity.expectedCloseDate", label: "Deal: Expected Close Date", category: "Deal", type: "date" },
  { value: "entity.closedAt", label: "Deal: Closed At", category: "Deal", type: "date" },
  { value: "entity.ownerUserId", label: "Deal: Owner User ID", category: "Deal", type: "string" },

  // Person
  { value: "entity.firstName", label: "Person: First Name", category: "Person", type: "string" },
  { value: "entity.lastName", label: "Person: Last Name", category: "Person", type: "string" },
  { value: "entity.displayName", label: "Person: Display Name", category: "Person", type: "string" },
  { value: "entity.email", label: "Person: Email", category: "Person", type: "string" },
  { value: "entity.phone", label: "Person: Phone", category: "Person", type: "string" },
  { value: "entity.jobTitle", label: "Person: Job Title", category: "Person", type: "string" },
  { value: "entity.ownerUserId", label: "Person: Owner User ID", category: "Person", type: "string" },

  // Company
  { value: "entity.name", label: "Company: Name", category: "Company", type: "string" },
  { value: "entity.domain", label: "Company: Domain", category: "Company", type: "string" },
  { value: "entity.industry", label: "Company: Industry", category: "Company", type: "string" },
  { value: "entity.employeeCount", label: "Company: Employee Count", category: "Company", type: "number" },
  { value: "entity.annualRevenue", label: "Company: Annual Revenue", category: "Company", type: "number" },
  { value: "entity.ownerUserId", label: "Company: Owner User ID", category: "Company", type: "string" },

  // Task
  { value: "entity.title", label: "Task: Title", category: "Task", type: "string" },
  { value: "entity.status", label: "Task: Status", category: "Task", type: "option", options: ["PENDING", "COMPLETED"] },
  { value: "entity.priority", label: "Task: Priority", category: "Task", type: "option", options: ["LOW", "MEDIUM", "HIGH"] },
  { value: "entity.dueAt", label: "Task: Due At", category: "Task", type: "date" },
  { value: "entity.assignedTo", label: "Task: Assigned To", category: "Task", type: "string" },

  // Activity
  { value: "entity.type", label: "Activity: Type", category: "Activity", type: "option", options: ["NOTE", "CALL", "MEETING", "EMAIL", "TASK"] },
  { value: "entity.subject", label: "Activity: Subject", category: "Activity", type: "string" },
  { value: "entity.description", label: "Activity: Description", category: "Activity", type: "string" },
  { value: "entity.performedAt", label: "Activity: Performed At", category: "Activity", type: "date" },

  // 1-Hop Relationships
  { value: "entity.company.name", label: "Related Company: Name", category: "Relationship", type: "string" },
  { value: "entity.company.domain", label: "Related Company: Domain", category: "Relationship", type: "string" },
  { value: "entity.company.industry", label: "Related Company: Industry", category: "Relationship", type: "string" },
  { value: "entity.primaryPerson.displayName", label: "Related Person: Display Name", category: "Relationship", type: "string" },
  { value: "entity.primaryPerson.email", label: "Related Person: Email", category: "Relationship", type: "string" },
  { value: "entity.primaryPerson.phone", label: "Related Person: Phone", category: "Relationship", type: "string" },
  { value: "entity.pipeline.name", label: "Related Pipeline: Name", category: "Relationship", type: "string" },
  { value: "entity.stage.name", label: "Related Stage: Name", category: "Relationship", type: "string" },
];

export const OPERATORS_BY_TYPE: Record<FieldDataType, FlowOperator[]> = {
  string: ["=", "!=", "contains", "exists", "IS EMPTY", "IS NOT EMPTY", "IN", "NOT IN"],
  number: ["=", "!=", ">", "<", ">=", "<=", "exists", "IS EMPTY", "IS NOT EMPTY", "IN", "NOT IN"],
  boolean: ["=", "!=", "exists", "IS EMPTY", "IS NOT EMPTY"],
  date: ["=", "!=", ">", "<", ">=", "<=", "exists", "IS EMPTY", "IS NOT EMPTY"],
  option: ["=", "!=", "exists", "IS EMPTY", "IS NOT EMPTY", "IN", "NOT IN"],
};

export const NO_VALUE_OPERATORS: FlowOperator[] = ["IS EMPTY", "IS NOT EMPTY", "exists"];

export interface FlowConditionBuilderProps {
  conditions: FlowCondition[];
  onChange: (conditions: FlowCondition[]) => void;
  readOnly?: boolean;
}

export const FlowConditionBuilder: React.FC<FlowConditionBuilderProps> = ({
  conditions,
  onChange,
  readOnly = false,
}) => {
  const handleAddCondition = () => {
    onChange([
      ...conditions,
      {
        source: "entity.status",
        operator: "=",
        value: "QUALIFIED",
        logic: "AND",
      },
    ]);
  };

  const handleRemoveCondition = (index: number) => {
    const updated = conditions.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateCondition = (index: number, patch: Partial<FlowCondition>) => {
    const next = [...conditions];
    const current = { ...next[index], ...patch };

    // If operator is changed to a no-value operator, remove value property
    if (patch.operator && NO_VALUE_OPERATORS.includes(patch.operator)) {
      delete current.value;
    }

    next[index] = current;
    onChange(next);
  };

  const getSourceMeta = (source: string): AllowlistedSource => {
    const found = ALLOWLISTED_SOURCES.find((s) => s.value === source);
    if (found) return found;

    // Detect type for unknown / custom field paths
    if (source.includes("score") || source.includes("value") || source.includes("count") || source.includes("number")) {
      return { value: source, label: source, category: "Custom", type: "number" };
    }
    if (source.includes("date") || source.includes("At") || source.includes("time")) {
      return { value: source, label: source, category: "Custom", type: "date" };
    }
    if (source.includes("is") || source.includes("has") || source.includes("flag")) {
      return { value: source, label: source, category: "Custom", type: "boolean" };
    }
    return { value: source, label: source, category: "Custom", type: "string" };
  };

  const renderValueInput = (cond: FlowCondition, index: number, meta: AllowlistedSource) => {
    if (NO_VALUE_OPERATORS.includes(cond.operator)) {
      return (
        <span className="text-[11px] text-slate-400 italic px-2 py-1 bg-slate-900/50 rounded border border-slate-800">
          (No value required)
        </span>
      );
    }

    // IN / NOT IN Array handling
    if (cond.operator === "IN" || cond.operator === "NOT IN") {
      const rawVal = Array.isArray(cond.value)
        ? cond.value.join(", ")
        : String(cond.value ?? "");

      return (
        <input
          type="text"
          disabled={readOnly}
          value={rawVal}
          onChange={(e) => {
            const raw = e.target.value;
            const items = raw.split(",").map((s) => s.trim()).filter(Boolean);
            let typedItems: unknown[] = items;
            if (meta.type === "number") {
              typedItems = items.map((i) => Number(i)).filter((n) => !isNaN(n));
            }
            handleUpdateCondition(index, { value: typedItems });
          }}
          placeholder="Comma-separated items (e.g. 50, 100)"
          className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
        />
      );
    }

    // Number type
    if (meta.type === "number") {
      const numVal = typeof cond.value === "number" ? cond.value : (cond.value !== undefined && cond.value !== null && cond.value !== "" ? Number(cond.value) : "");
      return (
        <input
          type="number"
          disabled={readOnly}
          value={numVal}
          onChange={(e) => {
            const valStr = e.target.value;
            const valNum = valStr === "" ? undefined : Number(valStr);
            handleUpdateCondition(index, { value: valNum });
          }}
          placeholder="Number value"
          className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
        />
      );
    }

    // Boolean type
    if (meta.type === "boolean") {
      const boolVal = cond.value === true ? "true" : cond.value === false ? "false" : "true";
      return (
        <select
          disabled={readOnly}
          value={boolVal}
          onChange={(e) => {
            handleUpdateCondition(index, { value: e.target.value === "true" });
          }}
          className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    }

    // Option with predefined values
    if (meta.type === "option" && meta.options && meta.options.length > 0) {
      return (
        <select
          disabled={readOnly}
          value={String(cond.value ?? meta.options[0])}
          onChange={(e) => {
            handleUpdateCondition(index, { value: e.target.value });
          }}
          className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          {meta.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    // Date type
    if (meta.type === "date") {
      const dateVal = typeof cond.value === "string" ? cond.value.slice(0, 10) : "";
      return (
        <input
          type="date"
          disabled={readOnly}
          value={dateVal}
          onChange={(e) => {
            handleUpdateCondition(index, { value: e.target.value });
          }}
          className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
        />
      );
    }

    // String / Default text input
    return (
      <input
        type="text"
        disabled={readOnly}
        value={String(cond.value ?? "")}
        onChange={(e) => {
          handleUpdateCondition(index, { value: e.target.value });
        }}
        placeholder="Value"
        className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
      />
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Conditions ({conditions.length})
        </h4>
        {!readOnly && (
          <button
            type="button"
            onClick={handleAddCondition}
            className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Condition
          </button>
        )}
      </div>

      {conditions.length === 0 ? (
        <div className="text-xs text-slate-500 italic p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-center">
          No conditions configured. This flow will trigger unconditionally for all matching events.
        </div>
      ) : (
        <div className="space-y-2">
          {conditions.map((cond, idx) => {
            const meta = getSourceMeta(cond.source);
            const allowedOperators = OPERATORS_BY_TYPE[meta.type] || OPERATORS_BY_TYPE.string;

            return (
              <div
                key={idx}
                className="flex flex-col md:flex-row md:items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800"
              >
                {/* Logic selector for condition joins */}
                <select
                  disabled={readOnly}
                  value={cond.logic || "AND"}
                  onChange={(e) =>
                    handleUpdateCondition(idx, { logic: e.target.value as "AND" | "OR" })
                  }
                  className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-semibold text-emerald-400 focus:outline-none focus:border-emerald-500"
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>

                {/* Source Picker */}
                <select
                  disabled={readOnly}
                  value={cond.source}
                  onChange={(e) => {
                    const newSource = e.target.value;
                    const newMeta = getSourceMeta(newSource);
                    const newAllowedOps = OPERATORS_BY_TYPE[newMeta.type] || OPERATORS_BY_TYPE.string;
                    const newOp = newAllowedOps.includes(cond.operator) ? cond.operator : newAllowedOps[0];
                    handleUpdateCondition(idx, { source: newSource, operator: newOp });
                  }}
                  className="w-full md:w-56 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <optgroup label="Lead">
                    {ALLOWLISTED_SOURCES.filter((s) => s.category === "Lead").map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Deal">
                    {ALLOWLISTED_SOURCES.filter((s) => s.category === "Deal").map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Person">
                    {ALLOWLISTED_SOURCES.filter((s) => s.category === "Person").map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Company">
                    {ALLOWLISTED_SOURCES.filter((s) => s.category === "Company").map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Task">
                    {ALLOWLISTED_SOURCES.filter((s) => s.category === "Task").map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Activity">
                    {ALLOWLISTED_SOURCES.filter((s) => s.category === "Activity").map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="1-Hop Relationships">
                    {ALLOWLISTED_SOURCES.filter((s) => s.category === "Relationship").map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </optgroup>
                  {!ALLOWLISTED_SOURCES.some((s) => s.value === cond.source) && (
                    <optgroup label="Custom Field Path">
                      <option value={cond.source}>{cond.source}</option>
                    </optgroup>
                  )}
                </select>

                {/* Operator Selector */}
                <select
                  disabled={readOnly}
                  value={cond.operator}
                  onChange={(e) =>
                    handleUpdateCondition(idx, { operator: e.target.value as FlowOperator })
                  }
                  className="w-full md:w-32 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {allowedOperators.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>

                {/* Value Control */}
                {renderValueInput(cond, idx, meta)}

                {/* Remove Button */}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(idx)}
                    className="self-end md:self-auto text-red-400 hover:text-red-300 p-1"
                    title="Remove condition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
