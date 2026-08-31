import React from "react";
import { Edit2, Move, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { PipelineRecord, StageRecord } from "../../pipelines/pipeline.types";
import type { DealRecord } from "../deal.types";
import type { CrmViewRecord } from "../../crm/views.types";
import { useCrmViewFieldsQuery } from "../../crm/views.queries";
import { resolveDealListColumns } from "../deal.utils";

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
      return { width: `${activeSavedView.columnWidths[fieldKey]}px`, maxWidth: `${activeSavedView.columnWidths[fieldKey]}px` };
    }
    return {};
  };

  const renderCell = (deal: DealRecord, fieldKey: string) => {
    const pipeline = deal.pipelineId ? pipelineMap.get(deal.pipelineId) : null;
    const stage = deal.stageId ? stageMap.get(deal.stageId) : null;
    const widthStyle = getWidthStyle(fieldKey);

    switch(fieldKey) {
      case "title":
        return <td key={fieldKey} className="p-3 font-semibold text-slate-900 truncate" style={widthStyle}>{deal.title}</td>;
      case "pipelineId":
        return <td key={fieldKey} className="p-3 text-slate-600 truncate" style={widthStyle}>{pipeline ? pipeline.name : deal.pipelineId || "None"}</td>;
      case "stageId":
        return (
          <td key={fieldKey} className="p-3 truncate" style={widthStyle}>
            {stage ? (
              <span className="inline-flex items-center space-x-1">
                <span>{stage.name}</span>
                {!stage.isActive && <span className="text-[10px] bg-slate-100 text-slate-500 px-1 rounded">(Inactive)</span>}
              </span>
            ) : (
              deal.stageId || "None"
            )}
          </td>
        );
      case "value":
        return (
          <td key={fieldKey} className="p-3 font-medium text-blue-700 truncate" style={widthStyle}>
            {deal.value !== undefined && deal.value !== null
              ? `${deal.value.toLocaleString()} ${deal.currency || "USD"}`
              : "-"}
          </td>
        );
      case "expectedCloseDate":
        return <td key={fieldKey} className="p-3 text-slate-500 truncate" style={widthStyle}>{deal.expectedCloseDate || "-"}</td>;
      case "status":
        return (
          <td key={fieldKey} className="p-3 truncate" style={widthStyle}>
            <span
              className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] ${
                deal.status === "WON"
                  ? "bg-green-100 text-green-700"
                  : deal.status === "LOST"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {deal.status}
            </span>
          </td>
        );
      default:
        // Handle generic fallback for other custom fields
        const val = deal[fieldKey as keyof DealRecord];
        return (
          <td key={fieldKey} className="p-3 text-slate-600 truncate" style={widthStyle}>
            {val !== undefined && val !== null ? String(val) : "-"}
          </td>
        );
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
                {renderColumns.map((col) => renderCell(deal, col))}
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
