export type CrmViewObjectKey = "Person" | "Company" | "Lead" | "Deal";
export type CrmViewVisibilityScope = "private" | "team" | "workspace";

export type CrmFieldType =
  | "TEXT"
  | "LONG_TEXT"
  | "NUMBER"
  | "CURRENCY"
  | "BOOLEAN"
  | "DATE"
  | "DATE_TIME"
  | "OPTION"
  | "MULTI_OPTION"
  | "EMAIL"
  | "PHONE"
  | "URL"
  | "RECORD_RELATIONSHIP";

export type CrmComparator =
  | "="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "IN"
  | "NOT IN"
  | "IS EMPTY"
  | "IS NOT EMPTY";

export type FilterValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | null;

export interface SortSpec {
  field: string;
  direction: "asc" | "desc";
}

export interface PredicateAstNode {
  type: "PREDICATE";
  field: string;
  comparator: CrmComparator;
  value?: FilterValue;
}

export interface LogicalAstNode {
  type: "LOGICAL";
  operator: "AND" | "OR";
  conditions: FilterAstNode[];
}

export type FilterAstNode = PredicateAstNode | LogicalAstNode;

export interface CrmFieldMetadata {
  key: string;
  label: string;
  type: CrmFieldType;
  filterable: boolean;
  sortable: boolean;
  selectable: boolean;
  groupable: boolean;
  comparators?: CrmComparator[];
  isCustom?: boolean;
  fieldDefinitionId?: string;
}

export interface CrmViewRecord {
  _id: string;
  workspaceId: string;
  objectKey: CrmViewObjectKey;
  name: string;
  description?: string | null;
  visibilityScope: CrmViewVisibilityScope;
  ownerUserId: string;
  isDefault: boolean;
  sorting?: SortSpec[];
  grouping?: { field: string; direction?: "asc" | "desc" } | null;
  visibleFields?: string[];
  hiddenFields?: string[];
  columnOrder?: string[];
  columnWidths?: Record<string, number>;
  filterAst?: FilterAstNode | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCrmViewPayload {
  name: string;
  description?: string;
  objectKey: CrmViewObjectKey;
  visibilityScope?: CrmViewVisibilityScope;
  isDefault?: boolean;
  sorting?: SortSpec[];
  grouping?: { field: string; direction?: "asc" | "desc" } | null;
  visibleFields?: string[];
  hiddenFields?: string[];
  columnOrder?: string[];
  columnWidths?: Record<string, number>;
  filterAst?: FilterAstNode | null;
}

export interface UpdateCrmViewPayload extends Partial<CreateCrmViewPayload> {}

export interface ViewExecutionResult<T = unknown> {
  view: {
    _id: string;
    name: string;
    objectKey: CrmViewObjectKey;
    visibleFields?: string[];
    columnOrder?: string[];
    columnWidths?: Record<string, number>;
  };
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
