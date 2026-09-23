"use client";

import { useState } from "react";
import {
  Percent,
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Edit2,
  PowerOff,
  ShieldCheck,
  Info,
} from "lucide-react";
import type { TaxConfiguration } from "../finance.types";
import {
  useTaxConfigurationsQuery,
  useDeactivateTaxConfigurationMutation,
} from "../finance.queries";
import { TaxConfigurationModal } from "./TaxConfigurationModal";
import { useWorkspace } from "../../../lib/workspace/workspace-context";

export function TaxConfigurationView() {
  const { activeMembership } = useWorkspace();
  const canManage = activeMembership?.role !== "viewer";

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<TaxConfiguration | null>(null);

  const { data: configs = [], isLoading, error } = useTaxConfigurationsQuery(
    activeFilter === "ACTIVE"
      ? { isActive: true }
      : activeFilter === "INACTIVE"
      ? { isActive: false }
      : undefined
  );

  const deactivateMutation = useDeactivateTaxConfigurationMutation();

  const handleEdit = (config: TaxConfiguration) => {
    setEditingConfig(config);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingConfig(null);
    setIsModalOpen(true);
  };

  const handleDeactivate = async (config: TaxConfiguration) => {
    if (!window.confirm(`Are you sure you want to deactivate tax code "${config.taxCode}"? Existing posted transactions will remain completely unchanged.`)) {
      return;
    }
    await deactivateMutation.mutateAsync(config._id);
  };

  const filteredConfigs = configs.filter((c) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      c.taxCode.toLowerCase().includes(term) ||
      c.taxType.toLowerCase().includes(term) ||
      (c.description && c.description.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Percent className="w-6 h-6 text-primary" />
            Tax Configurations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure GST codes, rates, and Chart of Accounts mappings for invoices, bills, and expenses.
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleNew}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Tax Code
          </button>
        )}
      </div>

      {/* Snapshot Integrity Notice */}
      <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-900 dark:text-blue-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div className="text-xs leading-relaxed space-y-1">
          <p className="font-semibold text-blue-950 dark:text-blue-100">
            Immutable Accounting Snapshot Boundary
          </p>
          <p>
            Tax configurations define rates and default posting accounts for new transactions. When a transaction is posted, its tax breakdown and ledger lines are frozen into the journal entry. Updating or deactivating a tax code does not alter past journals or historical tax reports.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tax code, type, or description..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as any)}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <span className="text-sm">Loading tax configurations...</span>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-destructive text-sm">
            Failed to load tax configurations. Please try again.
          </div>
        ) : filteredConfigs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Percent className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-medium text-foreground">No tax codes found</p>
            <p className="text-xs mt-1">
              {search ? "Try adjusting your search criteria" : "Click 'Add Tax Code' to configure your first tax rate"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="px-4 py-3">Tax Code</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Input Account (Dr)</th>
                  <th className="px-4 py-3">Output Account (Cr)</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredConfigs.map((config) => {
                  const inputAcc =
                    typeof config.inputAccountId === "object" && config.inputAccountId !== null
                      ? (config.inputAccountId as any)
                      : null;
                  const outputAcc =
                    typeof config.outputAccountId === "object" && config.outputAccountId !== null
                      ? (config.outputAccountId as any)
                      : null;

                  return (
                    <tr
                      key={config._id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {config.taxCode}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                          {config.taxType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {config.rate}%
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {inputAcc ? (
                          <span>
                            <span className="font-medium text-foreground">{inputAcc.code}</span> - {inputAcc.name}
                          </span>
                        ) : (
                          <span className="italic">Default Input IGST/CGST/SGST</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {outputAcc ? (
                          <span>
                            <span className="font-medium text-foreground">{outputAcc.code}</span> - {outputAcc.name}
                          </span>
                        ) : (
                          <span className="italic">Default Output IGST/CGST/SGST</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                        {config.description || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {config.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canManage && (
                            <>
                              <button
                                onClick={() => handleEdit(config)}
                                title="Edit Tax Rate & Accounts"
                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              {config.isActive && (
                                <button
                                  onClick={() => handleDeactivate(config)}
                                  title="Deactivate Tax Code"
                                  disabled={deactivateMutation.isPending}
                                  className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                  <PowerOff className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <TaxConfigurationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingConfig(null);
        }}
        configToEdit={editingConfig}
      />
    </div>
  );
}
