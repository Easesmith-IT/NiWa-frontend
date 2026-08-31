import React from "react";
import { cn } from "../../../lib/utils";

export interface CrmPageShellProps {
  breadcrumb?: React.ReactNode;
  title: string;
  description?: string;
  primaryAction?: React.ReactNode;
  viewContext?: React.ReactNode;
  queryControls?: React.ReactNode;
  executionContext?: React.ReactNode;
  dataSurface: React.ReactNode;
  pagination?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export const CrmPageShell: React.FC<CrmPageShellProps> = ({
  breadcrumb,
  title,
  description,
  primaryAction,
  viewContext,
  queryControls,
  executionContext,
  dataSurface,
  pagination,
  className,
  children,
}) => {
  return (
    <div className={cn("flex h-full flex-col space-y-4 p-6", className)}>
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {breadcrumb && <div className="mb-2 text-xs text-slate-500">{breadcrumb}</div>}
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>
        {primaryAction && (
          <div className="flex items-center space-x-2 shrink-0">
            {primaryAction}
          </div>
        )}
      </div>

      {/* View Context */}
      {viewContext && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          {viewContext}
        </div>
      )}

      {/* Query Controls & Execution Context */}
      {(queryControls || executionContext) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {queryControls}
          </div>
          {executionContext && (
            <div className="flex items-center space-x-2 shrink-0">
              {executionContext}
            </div>
          )}
        </div>
      )}

      {/* Data Surface */}
      <div className="min-h-0 flex-1 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
        {dataSurface}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="pt-2">
          {pagination}
        </div>
      )}

      {/* Hidden/Floating Modals and Overlays */}
      {children}
    </div>
  );
};
