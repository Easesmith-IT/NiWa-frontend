import React from "react";
import { Edit2, Move, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { PipelineRecord, StageRecord } from "../../pipelines/pipeline.types";
import type { DealRecord } from "../deal.types";
import type { CrmViewRecord } from "../../crm/views.types";
import { useCrmViewFieldsQuery } from "../../crm/views.queries";
import { resolveDealListColumns, resolveDealFieldValue } from "../deal.utils";

interface DealListViewProps {
  deals: DealRecord[];
  pipelines: PipelineRecord[];
  stages: StageRecord[];
  onEditDeal: (deal: DealRecord) => void;
  onMoveDeal: (deal: DealRecord) => void;
  onArchiveDeal: (deal: DealRecord) => void;
  activeSavedView?: CrmViewRecord | null;
}

export const DealListView: React.FC<DealListViewProps> = ({
  deals,
  pipelines,
  stages,
  onEditDeal,
  onMoveDeal,
  onArchiveDeal,
  activeSavedView,
}) => {
  const { data: fieldsData } = useCrmViewFieldsQuery("Deal");
  const availableFields = fieldsData?.fields || [];
  const fieldMetaMap = new Map(availableFields.map((f) => [f.key, f]));

  if (deals.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed rounded-lg bg-white">
        <p className="text-sm text-slate-500">No deals found.</p>
      </div>
    );
  }

  const pipelineMap = new Map(pipelines.map((p) => [p._id, p]));
  const stageMap = new Map(stages.map((s) => [s._id, s]));

  const renderColumns = resolveDealListColumns(activeSavedView);

  const getWidthStyle = (fieldKey: string) => {
    if (activeSavedView?.columnWidths?.[fieldKey]) {
      return {
        width: `${activeSavedView.columnWidths[fieldKey]}px`,
        maxWidth: `${activeSavedView.columnWidths[fieldKey]}px`,
      };
    }
    return {};
  };

  const renderCellContent = (deal: DealRecord, fieldKey: string) => {
    const resolved = resolveDealFieldValue(deal, fieldKey, availableFields);

    if (resolved.state === "UNAVAILABLE") {
      return <span className="text-slate-400 italic text-[11px]">Unavailable</span>;
    }

    if (resolved.state === "EMPTY") {
      return <span className="text-slate-400">-</span>;
    }

    const { value, fieldType } = resolved;
    const pipeline = deal.pipelineId ? pipelineMap.get(deal.pipelineId) : null;
    const stage = deal.stageId ? stageMap.get(deal.stageId) : null;

    // Special handling for key domain fields first
    if (fieldKey === "title") {
      return <span className="font-semibold text-slate-900">{String(value)}</span>;
    }

    if (fieldKey === "pipelineId") {
      return <span className="text-slate-600">{pipeline ? pipeline.name : String(value || "None")}</span>;
    }

    if (fieldKey === "stageId") {
      return stage ? (
        <span className="inline-flex items-center space-x-1">
          <span>{stage.name}</span>
          {!stage.isActive && <span className="text-[10px] bg-slate-100 text-slate-500 px-1 rounded">(Inactive)</span>}
        </span>
      ) : (
        <span>{String(value || "None")}</span>
      );
    }

    if (fieldKey === "value") {
      const numVal = typeof value === "number" ? value : Number(value);
      return (
        <span className="font-medium text-blue-700">
          {!isNaN(numVal) ? `${numVal.toLocaleString()} ${deal.currency || "USD"}` : String(value)}
        </span>
      );
    }

    if (fieldKey === "status") {
      const strStatus = String(value);
      return (
        <span
          className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] ${
            strStatus === "WON"
              ? "bg-green-100 text-green-700"
              : strStatus === "LOST"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {strStatus}
        </span>
      );
    }

    // Type-aware rendering for standard & custom fields based on CrmFieldType
    const effectiveType = fieldType || (resolved.fieldMeta?.type);

    switch (effectiveType) {
      case "BOOLEAN": {
        const isTrue = Boolean(value);
        return (
          <span
            className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] ${
              isTrue ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600"
            }`}
          >
            {isTrue ? "Yes" : "No"}
          </span>
        );
      }
      case "NUMBER":
      case "CURRENCY": {
        const num = typeof value === "number" ? value : Number(value);
        return <span>{!isNaN(num) ? num.toLocaleString() : String(value)}</span>;
      }
      case "DATE":
      case "DATE_TIME": {
        const dateStr = String(value);
        const parsed = new Date(dateStr);
        return <span className="text-slate-500">{!isNaN(parsed.getTime()) ? parsed.toLocaleDateString() : dateStr}</span>;
      }
      case "MULTI_OPTION": {
        if (Array.isArray(value)) {
          return (
            <span className="inline-flex flex-wrap gap-1">
              {value.map((v, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded">
                  {String(v)}
                </span>
              ))}
            </span>
          );
        }
        return <span className="text-slate-600">{String(value)}</span>;
      }
      case "OPTION": {
        return (
          <span className="inline-block px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700 text-[11px]">
            {String(value)}
          </span>
        );
      }
      case "RECORD_RELATIONSHIP": {
        if (typeof value === "object" && value !== null) {
          const obj = value as Record<string, unknown>;
          return <span>{String(obj.name || obj.title || obj.displayName || obj._id || JSON.stringify(value))}</span>;
        }
        return <span className="font-mono text-[11px] text-slate-600">{String(value)}</span>;
      }
      case "TEXT":
      case "LONG_TEXT":
      case "EMAIL":
      case "PHONE":
      case "URL":
      default:
        return <span className="text-slate-600">{String(value)}</span>;
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-xs table-fixed">
        <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
          <tr>
            {renderColumns.map((col) => {
              const meta = fieldMetaMap.get(col);
              const label = meta ? meta.label : col;
              return (
                <th key={col} className="p-3 truncate" style={getWidthStyle(col)}>
                  {label}
                </th>
              );
            })}
            <th className="p-3 text-right" style={{ width: "160px" }}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">
          {deals.map((deal) => {
            return (
              <tr key={deal._id} className="hover:bg-slate-50/80 transition-all">
                {renderColumns.map((col) => (
                  <td key={col} className="p-3 truncate" style={getWidthStyle(col)}>
                    {renderCellContent(deal, col)}
                  </td>
                ))}
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onMoveDeal(deal)}
                      className="h-7 px-2 text-[11px] text-slate-600 hover:text-blue-600"
                      title="Move Deal across Pipelines/Stages"
                    >
                      <Move className="h-3.5 w-3.5 mr-1" /> Move
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEditDeal(deal)}
                      className="h-7 px-2 text-[11px] text-slate-600 hover:text-blue-600"
                      title="Edit Deal"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onArchiveDeal(deal)}
                      className="h-7 px-2 text-[11px] text-slate-600 hover:text-rose-600"
                      title="Archive Deal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
