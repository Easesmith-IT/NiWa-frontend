import type { CrmFieldMetadata, CrmViewRecord } from "../crm/views.types";
import type { DealRecord } from "./deal.types";

export const DEFAULT_DEAL_COLUMNS = [
  "title",
  "pipelineId",
  "stageId",
  "value",
  "expectedCloseDate",
  "status",
];

export const resolveDealListColumns = (
  activeSavedView?: CrmViewRecord | null,
): string[] => {
  if (!activeSavedView || !activeSavedView.visibleFields || activeSavedView.visibleFields.length === 0) {
    return DEFAULT_DEAL_COLUMNS;
  }

  const visibleSet = new Set(activeSavedView.visibleFields);
  const ordered = activeSavedView.columnOrder || [];
  const finalCols: string[] = [];
  const added = new Set<string>();

  // 1. Add fields from columnOrder that are in visibleFields (excluding duplicates)
  for (const col of ordered) {
    if (visibleSet.has(col) && !added.has(col)) {
      finalCols.push(col);
      added.add(col);
    }
  }

  // 2. Append remaining visibleFields in their original visibleFields order
  for (const col of activeSavedView.visibleFields) {
    if (!added.has(col)) {
      finalCols.push(col);
      added.add(col);
    }
  }

  return finalCols;
};

export type FieldResolutionState = "PRESENT" | "EMPTY" | "UNAVAILABLE";

export interface ResolvedFieldValue {
  state: FieldResolutionState;
  value?: unknown;
  fieldType?: string;
  fieldMeta?: CrmFieldMetadata;
}

const KNOWN_STANDARD_KEYS = new Set([
  "_id",
  "title",
  "value",
  "currency",
  "pipelineId",
  "stageId",
  "status",
  "primaryPersonId",
  "companyId",
  "expectedCloseDate",
  "ownerUserId",
  "ownerTeamId",
  "description",
  "createdBy",
  "updatedBy",
  "closedAt",
  "isArchived",
  "archivedAt",
  "archivedBy",
  "createdAt",
  "updatedAt",
  "participants",
]);

export const resolveDealFieldValue = (
  deal: DealRecord,
  fieldKey: string,
  availableFields?: CrmFieldMetadata[],
): ResolvedFieldValue => {
  const fieldMeta = availableFields?.find((f) => f.key === fieldKey);

  // If availableFields metadata exists, check if the field is present in schema or standard list
  if (
    availableFields &&
    availableFields.length > 0 &&
    !fieldMeta &&
    !KNOWN_STANDARD_KEYS.has(fieldKey)
  ) {
    return { state: "UNAVAILABLE" };
  }

  const dealRecord = deal as unknown as Record<string, unknown>;
  const customFields = dealRecord.customFields as Record<string, unknown> | undefined;

  let rawValue: unknown = undefined;

  if (fieldKey in dealRecord) {
    rawValue = dealRecord[fieldKey];
  } else if (customFields && fieldKey in customFields) {
    rawValue = customFields[fieldKey];
  } else {
    if (fieldMeta) {
      return { state: "EMPTY", fieldMeta, fieldType: fieldMeta.type };
    }
    return { state: "EMPTY" };
  }

  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return { state: "EMPTY", fieldMeta, fieldType: fieldMeta?.type };
  }

  return {
    state: "PRESENT",
    value: rawValue,
    fieldMeta,
    fieldType: fieldMeta?.type,
  };
};
