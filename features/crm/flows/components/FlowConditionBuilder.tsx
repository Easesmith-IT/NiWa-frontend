"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import type { FlowCondition, FlowOperator } from "../flow.types";

export type CrmTargetEntityType = "Lead" | "Deal" | "Person" | "Company" | "Task" | "Activity";
export type FieldDataType = "string" | "number" | "boolean" | "date" | "option";

export interface CustomFieldDefinition {
  id: string; // e.g. "custom.66a98efc2f992d996df1370e" or "fields.66a98efc2f992d996df1370e"
  fieldKey: string;
  label: string;
  entityType: CrmTargetEntityType;
  type: FieldDataType;
  options?: string[];
}

export interface AllowlistedSourceField {
  value: string;
  label: string;
  entityType: CrmTargetEntityType;
  type: FieldDataType;
  isRelationship?: boolean;
  options?: string[];
}

/**
 * Authoritative Backend Source Registry Catalog matching crm-flow-source-registry.ts
 */
export const BACKEND_SOURCE_CATALOG: Record<CrmTargetEntityType, AllowlistedSourceField[]> = {
  Lead: [
    { value: "entity._id", label: "Lead: ID (_id)", entityType: "Lead", type: "string" },
    { value: "entity.id", label: "Lead: ID (id)", entityType: "Lead", type: "string" },
    { value: "entity.title", label: "Lead: Title", entityType: "Lead", type: "string" },
    { value: "entity.status", label: "Lead: Status", entityType: "Lead", type: "option", options: ["NEW", "CONTACTED", "QUALIFIED", "UNQUALIFIED", "CONVERTED"] },
    { value: "entity.source", label: "Lead: Source", entityType: "Lead", type: "string" },
    { value: "entity.value", label: "Lead: Value", entityType: "Lead", type: "number" },
    { value: "entity.currency", label: "Lead: Currency", entityType: "Lead", type: "string" },
    { value: "entity.ownerUserId", label: "Lead: Owner User ID", entityType: "Lead", type: "string" },
    { value: "entity.createdBy", label: "Lead: Created By", entityType: "Lead", type: "string" },
    { value: "entity.createdAt", label: "Lead: Created At", entityType: "Lead", type: "date" },
    { value: "entity.updatedAt", label: "Lead: Updated At", entityType: "Lead", type: "date" },
    // Lead -> Company Relationship
    { value: "entity.company.name", label: "Related Company: Name", entityType: "Lead", type: "string", isRelationship: true },
    { value: "entity.company.domain", label: "Related Company: Domain", entityType: "Lead", type: "string", isRelationship: true },
    { value: "entity.company.industry", label: "Related Company: Industry", entityType: "Lead", type: "string", isRelationship: true },
    { value: "entity.company.ownerUserId", label: "Related Company: Owner User ID", entityType: "Lead", type: "string", isRelationship: true },
    { value: "entity.company.createdBy", label: "Related Company: Created By", entityType: "Lead", type: "string", isRelationship: true },
    { value: "entity.company.createdAt", label: "Related Company: Created At", entityType: "Lead", type: "date", isRelationship: true },
    { value: "entity.company.updatedAt", label: "Related Company: Updated At", entityType: "Lead", type: "date", isRelationship: true },
    // Lead -> Primary Person Relationship
    { value: "entity.primaryPerson.firstName", label: "Related Person: First Name", entityType: "Lead", type: "string", isRelationship: true },
    { value: "entity.primaryPerson.lastName", label: "Related Person: Last Name", entityType: "Lead", type: "string", isRelationship: true },
    { value: "entity.primaryPerson.email", label: "Related Person: Email", entityType: "Lead", type: "string", isRelationship: true },
    { value: "entity.primaryPerson.phone", label: "Related Person: Phone", entityType: "Lead", type: "string", isRelationship: true },
    { value: "entity.primaryPerson.jobTitle", label: "Related Person: Job Title", entityType: "Lead", type: "string", isRelationship: true },
    { value: "entity.primaryPerson.companyId", label: "Related Person: Company ID", entityType: "Lead", type: "string", isRelationship: true },
    { value: "entity.primaryPerson.ownerUserId", label: "Related Person: Owner User ID", entityType: "Lead", type: "string", isRelationship: true },
    { value: "entity.primaryPerson.createdBy", label: "Related Person: Created By", entityType: "Lead", type: "string", isRelationship: true },
    { value: "entity.primaryPerson.createdAt", label: "Related Person: Created At", entityType: "Lead", type: "date", isRelationship: true },
    { value: "entity.primaryPerson.updatedAt", label: "Related Person: Updated At", entityType: "Lead", type: "date", isRelationship: true },
  ],

  Deal: [
    { value: "entity._id", label: "Deal: ID (_id)", entityType: "Deal", type: "string" },
    { value: "entity.id", label: "Deal: ID (id)", entityType: "Deal", type: "string" },
    { value: "entity.title", label: "Deal: Title", entityType: "Deal", type: "string" },
    { value: "entity.stageId", label: "Deal: Stage ID", entityType: "Deal", type: "string" },
    { value: "entity.pipelineId", label: "Deal: Pipeline ID", entityType: "Deal", type: "string" },
    { value: "entity.value", label: "Deal: Value", entityType: "Deal", type: "number" },
    { value: "entity.currency", label: "Deal: Currency", entityType: "Deal", type: "string" },
    { value: "entity.status", label: "Deal: Status", entityType: "Deal", type: "option", options: ["OPEN", "WON", "LOST"] },
    { value: "entity.ownerUserId", label: "Deal: Owner User ID", entityType: "Deal", type: "string" },
    { value: "entity.expectedCloseDate", label: "Deal: Expected Close Date", entityType: "Deal", type: "date" },
    { value: "entity.createdBy", label: "Deal: Created By", entityType: "Deal", type: "string" },
    { value: "entity.createdAt", label: "Deal: Created At", entityType: "Deal", type: "date" },
    { value: "entity.updatedAt", label: "Deal: Updated At", entityType: "Deal", type: "date" },
    // Deal -> Company Relationship
    { value: "entity.company.name", label: "Related Company: Name", entityType: "Deal", type: "string", isRelationship: true },
    { value: "entity.company.domain", label: "Related Company: Domain", entityType: "Deal", type: "string", isRelationship: true },
    { value: "entity.company.industry", label: "Related Company: Industry", entityType: "Deal", type: "string", isRelationship: true },
    { value: "entity.company.ownerUserId", label: "Related Company: Owner User ID", entityType: "Deal", type: "string", isRelationship: true },
    { value: "entity.company.createdBy", label: "Related Company: Created By", entityType: "Deal", type: "string", isRelationship: true },
    { value: "entity.company.createdAt", label: "Related Company: Created At", entityType: "Deal", type: "date", isRelationship: true },
    { value: "entity.company.updatedAt", label: "Related Company: Updated At", entityType: "Deal", type: "date", isRelationship: true },
    // Deal -> Primary Person Relationship
    { value: "entity.primaryPerson.firstName", label: "Related Person: First Name", entityType: "Deal", type: "string", isRelationship: true },
    { value: "entity.primaryPerson.lastName", label: "Related Person: Last Name", entityType: "Deal", type: "string", isRelationship: true },
    { value: "entity.primaryPerson.email", label: "Related Person: Email", entityType: "Deal", type: "string", isRelationship: true },
    { value: "entity.primaryPerson.phone", label: "Related Person: Phone", entityType: "Deal", type: "string", isRelationship: true },
    { value: "entity.primaryPerson.jobTitle", label: "Related Person: Job Title", entityType: "Deal", type: "string", isRelationship: true },
    { value: "entity.primaryPerson.companyId", label: "Related Person: Company ID", entityType: "Deal", type: "string", isRelationship: true },
    { value: "entity.primaryPerson.ownerUserId", label: "Related Person: Owner User ID", entityType: "Deal", type: "string", isRelationship: true },
    { value: "entity.primaryPerson.createdBy", label: "Related Person: Created By", entityType: "Deal", type: "string", isRelationship: true },
    { value: "entity.primaryPerson.createdAt", label: "Related Person: Created At", entityType: "Deal", type: "date", isRelationship: true },
    { value: "entity.primaryPerson.updatedAt", label: "Related Person: Updated At", entityType: "Deal", type: "date", isRelationship: true },
  ],

  Person: [
    { value: "entity._id", label: "Person: ID (_id)", entityType: "Person", type: "string" },
    { value: "entity.id", label: "Person: ID (id)", entityType: "Person", type: "string" },
    { value: "entity.firstName", label: "Person: First Name", entityType: "Person", type: "string" },
    { value: "entity.lastName", label: "Person: Last Name", entityType: "Person", type: "string" },
    { value: "entity.email", label: "Person: Email", entityType: "Person", type: "string" },
    { value: "entity.phone", label: "Person: Phone", entityType: "Person", type: "string" },
    { value: "entity.jobTitle", label: "Person: Job Title", entityType: "Person", type: "string" },
    { value: "entity.companyId", label: "Person: Company ID", entityType: "Person", type: "string" },
    { value: "entity.ownerUserId", label: "Person: Owner User ID", entityType: "Person", type: "string" },
    { value: "entity.createdBy", label: "Person: Created By", entityType: "Person", type: "string" },
    { value: "entity.createdAt", label: "Person: Created At", entityType: "Person", type: "date" },
    { value: "entity.updatedAt", label: "Person: Updated At", entityType: "Person", type: "date" },
    // Person -> Company Relationship
    { value: "entity.company.name", label: "Related Company: Name", entityType: "Person", type: "string", isRelationship: true },
    { value: "entity.company.domain", label: "Related Company: Domain", entityType: "Person", type: "string", isRelationship: true },
    { value: "entity.company.industry", label: "Related Company: Industry", entityType: "Person", type: "string", isRelationship: true },
    { value: "entity.company.ownerUserId", label: "Related Company: Owner User ID", entityType: "Person", type: "string", isRelationship: true },
    { value: "entity.company.createdBy", label: "Related Company: Created By", entityType: "Person", type: "string", isRelationship: true },
    { value: "entity.company.createdAt", label: "Related Company: Created At", entityType: "Person", type: "date", isRelationship: true },
    { value: "entity.company.updatedAt", label: "Related Company: Updated At", entityType: "Person", type: "date", isRelationship: true },
  ],

  Company: [
    { value: "entity._id", label: "Company: ID (_id)", entityType: "Company", type: "string" },
    { value: "entity.id", label: "Company: ID (id)", entityType: "Company", type: "string" },
    { value: "entity.name", label: "Company: Name", entityType: "Company", type: "string" },
    { value: "entity.domain", label: "Company: Domain", entityType: "Company", type: "string" },
    { value: "entity.industry", label: "Company: Industry", entityType: "Company", type: "string" },
    { value: "entity.ownerUserId", label: "Company: Owner User ID", entityType: "Company", type: "string" },
    { value: "entity.createdBy", label: "Company: Created By", entityType: "Company", type: "string" },
    { value: "entity.createdAt", label: "Company: Created At", entityType: "Company", type: "date" },
    { value: "entity.updatedAt", label: "Company: Updated At", entityType: "Company", type: "date" },
  ],

  Task: [
    { value: "entity._id", label: "Task: ID (_id)", entityType: "Task", type: "string" },
    { value: "entity.id", label: "Task: ID (id)", entityType: "Task", type: "string" },
    { value: "entity.title", label: "Task: Title", entityType: "Task", type: "string" },
    { value: "entity.status", label: "Task: Status", entityType: "Task", type: "option", options: ["PENDING", "COMPLETED"] },
    { value: "entity.priority", label: "Task: Priority", entityType: "Task", type: "option", options: ["LOW", "MEDIUM", "HIGH"] },
    { value: "entity.dueAt", label: "Task: Due At", entityType: "Task", type: "date" },
    { value: "entity.authorId", label: "Task: Author ID", entityType: "Task", type: "string" },
    { value: "entity.createdBy", label: "Task: Created By", entityType: "Task", type: "string" },
    { value: "entity.createdAt", label: "Task: Created At", entityType: "Task", type: "date" },
    { value: "entity.updatedAt", label: "Task: Updated At", entityType: "Task", type: "date" },
  ],

  Activity: [
    { value: "entity._id", label: "Activity: ID (_id)", entityType: "Activity", type: "string" },
    { value: "entity.id", label: "Activity: ID (id)", entityType: "Activity", type: "string" },
    { value: "entity.type", label: "Activity: Type", entityType: "Activity", type: "option", options: ["NOTE", "CALL", "MEETING", "EMAIL", "TASK"] },
    { value: "entity.description", label: "Activity: Description", entityType: "Activity", type: "string" },
    { value: "entity.actorId", label: "Activity: Actor ID", entityType: "Activity", type: "string" },
    { value: "entity.relatedRecordId", label: "Activity: Related Record ID", entityType: "Activity", type: "string" },
    { value: "entity.relatedRecordType", label: "Activity: Related Record Type", entityType: "Activity", type: "string" },
    { value: "entity.createdAt", label: "Activity: Created At", entityType: "Activity", type: "date" },
    { value: "entity.updatedAt", label: "Activity: Updated At", entityType: "Activity", type: "date" },
  ],
};

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
  targetEntityType?: CrmTargetEntityType;
  customFieldDefinitions?: CustomFieldDefinition[];
  readOnly?: boolean;
}

export const FlowConditionBuilder: React.FC<FlowConditionBuilderProps> = ({
  conditions,
  onChange,
  targetEntityType = "Lead",
  customFieldDefinitions = [],
  readOnly = false,
}) => {
  // Filter available fields based on target entity type
  const availableTargetFields = BACKEND_SOURCE_CATALOG[targetEntityType] || BACKEND_SOURCE_CATALOG.Lead;
  const availableCustomFields = customFieldDefinitions.filter((cf) => cf.entityType === targetEntityType);

  const handleAddCondition = () => {
    const defaultField = availableTargetFields[0]?.value || "entity.status";
    onChange([
      ...conditions,
      {
        source: defaultField,
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

  // Strictly look up source metadata from catalog or custom field definitions. ZERO HEURISTIC NAMING GUESSES!
  const getSourceMeta = (source: string): AllowlistedSourceField => {
    const catalog = BACKEND_SOURCE_CATALOG[targetEntityType] || BACKEND_SOURCE_CATALOG.Lead;
    const foundInTarget = catalog.find((s) => s.value === source);
    if (foundInTarget) return foundInTarget;

    // Check across all backend catalog categories
    for (const catList of Object.values(BACKEND_SOURCE_CATALOG)) {
      const found = catList.find((s) => s.value === source);
      if (found) return found;
    }

    // Check explicit custom field definitions
    if (customFieldDefinitions.length > 0) {
      const customDef = customFieldDefinitions.find(
        (cf) =>
          cf.id === source ||
          cf.fieldKey === source ||
          `custom.${cf.fieldKey}` === source ||
          `fields.${cf.fieldKey}` === source ||
          `custom.${cf.id}` === source,
      );
      if (customDef) {
        return {
          value: source,
          label: customDef.label || source,
          entityType: customDef.entityType,
          type: customDef.type,
          options: customDef.options,
        };
      }
    }

    // Canonical Fallback for unknown / custom field paths: TYPE IS STRING (NO regex/name heuristic guessing!)
    return { value: source, label: source, entityType: targetEntityType, type: "string" };
  };

  const renderValueInput = (cond: FlowCondition, index: number, meta: AllowlistedSourceField) => {
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
          Conditions ({conditions.length}) — Target: {targetEntityType}
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

                {/* Target-Entity Aware Source Picker */}
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
                  <optgroup label={`${targetEntityType} Standard Fields`}>
                    {availableTargetFields.filter((s) => !s.isRelationship).map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </optgroup>
                  {availableTargetFields.some((s) => s.isRelationship) && (
                    <optgroup label="Allowed 1-Hop Relationships">
                      {availableTargetFields.filter((s) => s.isRelationship).map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </optgroup>
                  )}
                  {availableCustomFields.length > 0 && (
                    <optgroup label="Custom Fields">
                      {availableCustomFields.map((cf) => (
                        <option key={cf.id} value={cf.id}>{cf.label}</option>
                      ))}
                    </optgroup>
                  )}
                  {!availableTargetFields.some((s) => s.value === cond.source) && (
                    <optgroup label="Existing / Custom Path">
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
