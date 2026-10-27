"use client";

import React, { useState } from "react";
import {
  Tag,
  Info,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { WhatsAppCustomerRateCard } from "../whatsapp-billing.types";
import { useAdminCreateCustomerRateCard } from "../whatsapp-billing.queries";
import {
  PRICING_CATEGORIES,
  resolveCategoryPricingView,
  resolveEditorInitialPrice,
  type WhatsAppBillingCategory,
} from "../customer-pricing.utils";

interface CustomerPricingCardProps {
  rateCards?: WhatsAppCustomerRateCard[];
  isLoading: boolean;
  isAdmin?: boolean;
  workspaceId?: string;
}

export const CustomerPricingCard: React.FC<CustomerPricingCardProps> = ({
  rateCards = [],
  isLoading,
  isAdmin = true,
  workspaceId = "default",
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<WhatsAppBillingCategory>("marketing");
  const [pricePaiseInput, setPricePaiseInput] = useState<number | "">("");
  const [taxPercentInput, setTaxPercentInput] = useState<number>(18);
  const [taxModeInput, setTaxModeInput] = useState<"exclusive" | "inclusive">("exclusive");
  const [notesInput, setNotesInput] = useState<string>("");

  const createCardMutation = useAdminCreateCustomerRateCard();

  const handleOpenEdit = (category: WhatsAppBillingCategory, currentPricePaise?: number) => {
    setSelectedCategory(category);
    setPricePaiseInput(resolveEditorInitialPrice(currentPricePaise));
    setTaxPercentInput(18);
    setTaxModeInput("exclusive");
    setNotesInput("");
    setShowEditModal(true);
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pricePaiseInput === "" || Number(pricePaiseInput) <= 0) {
      return;
    }

    try {
      await createCardMutation.mutateAsync({
        category: selectedCategory,
        pricePaise: Number(pricePaiseInput),
        taxPercent: Number(taxPercentInput),
        taxMode: taxModeInput,
        notes: notesInput.trim() || undefined,
        workspaceId,
      });
      setShowEditModal(false);
    } catch (err) {
      console.error("Failed to update customer price:", err);
    }
  };

  const viewModels = PRICING_CATEGORIES.map((cat) => {
    const card = rateCards.find((c) => c.category === cat.key);
    return resolveCategoryPricingView(card, cat);
  });

  const unconfiguredCount = viewModels.filter((v) => !v.isConfigured).length;
  const activeSelectedMeta = PRICING_CATEGORIES.find((c) => c.key === selectedCategory);
  const activeSelectedCard = rateCards.find((c) => c.category === selectedCategory);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              NIWA Customer Selling Pricing
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Independent customer pricing system. Customer prices require explicit commercial approval before messages can be billed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Market: India (IN)
          </span>
        </div>
      </div>

      {/* Unconfigured Warning Banner */}
      {unconfiguredCount > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>{unconfiguredCount} of 4 categories unconfigured:</strong> Outbound WhatsApp messages in unconfigured categories will fail closed (<code className="font-mono text-[11px] bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">BILLING_PRICE_UNRESOLVED</code>) until an approved commercial price is configured.
            </span>
          </div>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {viewModels.map((item) => {
          return (
            <div
              key={item.category}
              data-testid={`pricing-card-${item.category}`}
              className={`rounded-lg border p-4 transition-all flex flex-col justify-between ${
                item.isConfigured
                  ? "border-slate-200 bg-slate-50/50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40"
                  : "border-dashed border-amber-300 bg-amber-50/30 hover:border-amber-400 dark:border-amber-800/60 dark:bg-amber-950/20"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    {item.label}
                  </span>
                  {item.isConfigured ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200 shadow-2xs dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {item.pricePaiseBadgeText}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100/80 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                      <AlertCircle className="h-2.5 w-2.5" />
                      Unconfigured
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  {item.isConfigured ? (
                    <>
                      <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                        {item.priceDisplayInr}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.billingRuleNote}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                        Not Configured
                      </div>
                      <div className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5 font-medium">
                        Requires commercial rate approval
                      </div>
                    </>
                  )}
                </div>

                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {item.desc}
                </p>

                {/* Explicit Illustrative Baseline Callout */}
                <div className="mt-3 rounded-md bg-slate-100/70 p-2 text-[11px] text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/40">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    Illustrative benchmark:
                  </span>{" "}
                  ₹{item.illustrativeBenchmarkInr} ({item.illustrativeBenchmarkPaise}p) —{" "}
                  <span className="italic">{item.isConfigured ? "commercial baseline" : "not active"}</span>
                </div>
              </div>

              {isAdmin && (
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                  <Button
                    variant={item.isConfigured ? "outline" : "primary"}
                    size="sm"
                    onClick={() => handleOpenEdit(item.category, item.pricePaiseValue)}
                    className={`w-full text-xs font-medium h-8 ${
                      item.isConfigured
                        ? ""
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    {item.buttonText}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pricing Rule Note */}
      <div className="mt-5 rounded-lg bg-indigo-50/60 p-3.5 text-xs text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300 flex items-start gap-2.5 border border-indigo-100 dark:border-indigo-900">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
        <div>
          <span className="font-semibold">Independent Two-Tier Financial Separation:</span>{" "}
          NIWA charges customer wallets strictly according to approved customer rate cards. If no active customer rate card is configured for a category, message dispatch fails closed to prevent unbilled usage. Meta wholesale costs are computed separately to evaluate margins without contaminating customer billing.
        </div>
      </div>

      {/* Edit / Configure Customer Price Modal */}
      {showEditModal && activeSelectedMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {activeSelectedCard ? "Update Approved Price" : "Configure Approved Price"}: {activeSelectedMeta.label}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure commercially approved customer selling price in integer paise. Messages in this category cannot be dispatched or billed without an approved card.
            </p>

            {!activeSelectedCard && (
              <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 p-2.5 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>
                  No approved rate card currently exists for {activeSelectedMeta.label}. Please enter the approved commercial rate below.
                </span>
              </div>
            )}

            <form onSubmit={handleSavePrice} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Price in Paise (Required integer, e.g. 88 = ₹0.88)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="Enter approved price in paise"
                  value={pricePaiseInput}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (val === "") {
                      setPricePaiseInput("");
                    } else {
                      const parsed = parseInt(val, 10);
                      setPricePaiseInput(isNaN(parsed) ? "" : parsed);
                    }
                  }}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                {pricePaiseInput !== "" && Number(pricePaiseInput) > 0 ? (
                  <div className="text-[11px] text-slate-500 mt-1">
                    Equals ₹{(Number(pricePaiseInput) / 100).toFixed(2)} per delivered message
                  </div>
                ) : (
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                    * Enter the commercially approved rate in integer paise.
                  </div>
                )}
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 italic">
                  Illustrative benchmark reference: ₹{activeSelectedMeta.illustrativeBenchmarkInr} ({activeSelectedMeta.illustrativeBenchmarkPaise} paise) — must be verified with commercial approval.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    GST Percent (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxPercentInput}
                    onChange={(e) => setTaxPercentInput(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tax Mode
                  </label>
                  <select
                    value={taxModeInput}
                    onChange={(e) => setTaxModeInput(e.target.value as any)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="exclusive">Exclusive (+ GST)</option>
                    <option value="inclusive">Inclusive (in price)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Commercial Approval / Audit Notes
                </label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. Commercial ticket #COMM-2026-Q4 approval by Finance"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createCardMutation.isPending || pricePaiseInput === "" || Number(pricePaiseInput) <= 0}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                >
                  {createCardMutation.isPending
                    ? "Saving..."
                    : activeSelectedCard
                    ? "Update Approved Price"
                    : "Save Approved Rate Card"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
