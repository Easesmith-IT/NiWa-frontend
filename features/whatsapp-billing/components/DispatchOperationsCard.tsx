"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  useAdminDispatchOperations,
  useResolveAdminDispatchOperation,
} from "../whatsapp-billing.queries";

export const DispatchOperationsCard: React.FC<{ workspaceId: string }> = ({ workspaceId }) => {
  const { data: operations = [], isLoading, refetch, isFetching } = useAdminDispatchOperations(workspaceId);
  const resolveMutation = useResolveAdminDispatchOperation();
  const [evidenceRefs, setEvidenceRefs] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string | null>(null);

  const resolve = async (operationId: string, providerStatus: "delivered" | "failed") => {
    const evidenceRef = (evidenceRefs[operationId] || "").trim();
    if (!evidenceRef) {
      setErrors("Enter an evidence reference before resolving an uncertain operation.");
      return;
    }
    setErrors(null);
    try {
      await resolveMutation.mutateAsync({ operationId, providerStatus, evidenceRef });
      setEvidenceRefs((previous) => ({ ...previous, [operationId]: "" }));
    } catch (error: any) {
      setErrors(error?.response?.data?.message || error?.message || "Could not resolve dispatch operation.");
    }
  };

  return (
    <section className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm dark:border-amber-900 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-950/40">
            <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Dispatch operations requiring review</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Unknown outcomes are not safe to retry blindly. Resolve only with an authoritative provider evidence reference.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {errors && (
        <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
          {errors}
        </div>
      )}

      {isLoading ? (
        <p className="py-6 text-center text-xs text-slate-500">Loading dispatch operations…</p>
      ) : operations.length === 0 ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-3 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          No unresolved dispatch operations for this workspace.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {operations.map((operation) => (
            <div key={operation.operationId} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="break-all font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">{operation.operationId}</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    {operation.category} · {operation.messageType} · {operation.recipientPhoneNumber}
                  </p>
                  <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
                    Status: {operation.status}
                    {operation.metaMessageId ? ` · Meta ID: ${operation.metaMessageId}` : " · Meta message ID not yet known"}
                  </p>
                  {operation.lastError && <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-300">{operation.lastError}</p>}
                </div>
                <ShieldCheck className="h-4 w-4 shrink-0 text-slate-400" />
              </div>
              {operation.metaMessageId && (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={evidenceRefs[operation.operationId] || ""}
                    onChange={(event) => setEvidenceRefs((previous) => ({ ...previous, [operation.operationId]: event.target.value }))}
                    placeholder="Provider evidence / incident reference"
                    className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={resolveMutation.isPending}
                    onClick={() => resolve(operation.operationId, "delivered")}
                  >
                    Confirm delivered
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={resolveMutation.isPending}
                    onClick={() => resolve(operation.operationId, "failed")}
                  >
                    Confirm failed
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
