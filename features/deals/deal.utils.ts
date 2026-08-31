import type { CrmViewRecord } from "../crm/views.types";

export const resolveDealListColumns = (activeSavedView?: CrmViewRecord | null): string[] => {
  const defaultColumns = ["title", "pipelineId", "stageId", "value", "expectedCloseDate", "status"];
  
  if (activeSavedView && activeSavedView.visibleFields) {
    const visibleSet = new Set(activeSavedView.visibleFields);
    const ordered = activeSavedView.columnOrder || [];
    const finalCols: string[] = [];
    
    for (const col of ordered) {
      if (visibleSet.has(col)) {
        finalCols.push(col);
        visibleSet.delete(col);
      }
    }
    for (const col of visibleSet) {
      finalCols.push(col);
    }
    return finalCols;
  }
  
  return defaultColumns;
};
