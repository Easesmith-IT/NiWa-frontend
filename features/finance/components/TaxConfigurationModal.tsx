"use client";

import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import type {
  TaxConfiguration,
  CreateTaxConfigurationPayload,
  UpdateTaxConfigurationPayload,
  Account,
} from "../finance.types";
import {
  useCreateTaxConfigurationMutation,
  useUpdateTaxConfigurationMutation,
  useAccountsQuery,
} from "../finance.queries";

interface TaxConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  configToEdit?: TaxConfiguration | null;
}

export function TaxConfigurationModal({
  isOpen,
  onClose,
  configToEdit,
}: TaxConfigurationModalProps) {
  const isEditing = Boolean(configToEdit);

  const [taxCode, setTaxCode] = useState("");
  const [taxType, setTaxType] = useState<"CGST" | "SGST" | "IGST" | "CESS">("IGST");
  const [rate, setRate] = useState<number | string>(18);
  const [inputAccountId, setInputAccountId] = useState("");
  const [outputAccountId, setOutputAccountId] = useState("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: accounts = [], isLoading: isLoadingAccounts } = useAccountsQuery({
    isActive: true,
  });

  const createMutation = useCreateTaxConfigurationMutation();
  const updateMutation = useUpdateTaxConfigurationMutation();

  useEffect(() => {
    if (configToEdit) {
      setTaxCode(configToEdit.taxCode);
      setTaxType(configToEdit.taxType);
      setRate(configToEdit.rate);
      setInputAccountId(
        typeof configToEdit.inputAccountId === "object" && configToEdit.inputAccountId !== null
          ? (configToEdit.inputAccountId as any)._id
          : configToEdit.inputAccountId || ""
      );
      setOutputAccountId(
        typeof configToEdit.outputAccountId === "object" && configToEdit.outputAccountId !== null
          ? (configToEdit.outputAccountId as any)._id
          : configToEdit.outputAccountId || ""
      );
      setDescription(configToEdit.description || "");
    } else {
      setTaxCode("");
      setTaxType("IGST");
      setRate(18);
      setInputAccountId("");
      setOutputAccountId("");
      setDescription("");
    }
    setErrorMsg(null);
  }, [configToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numRate = Number(rate);
    if (isNaN(numRate) || numRate < 0 || numRate > 100) {
      setErrorMsg("Tax rate must be a valid number between 0 and 100%");
      return;
    }

    try {
      if (isEditing && configToEdit) {
        const payload: UpdateTaxConfigurationPayload = {
          rate: numRate,
          inputAccountId: inputAccountId ? inputAccountId : null,
          outputAccountId: outputAccountId ? outputAccountId : null,
          description: description.trim() || null,
        };
        await updateMutation.mutateAsync({ id: configToEdit._id, payload });
      } else {
        if (!taxCode.trim()) {
          setErrorMsg("Tax Code is required (e.g. GST18, CGST9)");
          return;
        }
        const payload: CreateTaxConfigurationPayload = {
          taxCode: taxCode.trim().toUpperCase(),
          taxType,
          rate: numRate,
          inputAccountId: inputAccountId ? inputAccountId : null,
          outputAccountId: outputAccountId ? outputAccountId : null,
          description: description.trim() || null,
        };
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to save tax configuration";
      setErrorMsg(msg);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Filter accounts for input (Asset / Expense) and output (Liability / Income)
  const postingAccounts = accounts.filter((a: Account) => a.allowPosting);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-xl bg-card border border-border shadow-xl p-6 transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {isEditing ? "Edit Tax Configuration" : "New Tax Configuration"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Tax Code *
              </label>
              <input
                type="text"
                disabled={isEditing || isPending}
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value.toUpperCase())}
                placeholder="e.g. GST18"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Tax Type *
              </label>
              <select
                disabled={isEditing || isPending}
                value={taxType}
                onChange={(e) => setTaxType(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="CGST">CGST (Central)</option>
                <option value="SGST">SGST (State)</option>
                <option value="IGST">IGST (Integrated)</option>
                <option value="CESS">CESS</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Tax Rate (%) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              disabled={isPending}
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="e.g. 18"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
              required
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Percentage rate applied to taxable amounts (0 to 100).
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Input Tax Account (Asset)
              </label>
              <select
                disabled={isPending || isLoadingAccounts}
                value={inputAccountId}
                onChange={(e) => setInputAccountId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                <option value="">Default Input Account</option>
                {postingAccounts.map((a: Account) => (
                  <option key={a._id} value={a._id}>
                    {a.code} - {a.name} ({a.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Output Tax Account (Liability)
              </label>
              <select
                disabled={isPending || isLoadingAccounts}
                value={outputAccountId}
                onChange={(e) => setOutputAccountId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                <option value="">Default Output Account</option>
                {postingAccounts.map((a: Account) => (
                  <option key={a._id} value={a._id}>
                    {a.code} - {a.name} ({a.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Description / Notes
            </label>
            <input
              type="text"
              disabled={isPending}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Standard GST Rate on inter-state sales"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Tax Code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
