"use client";

import React, { useState } from "react";
import {
  Tag,
  DollarSign,
  Calendar,
  Layers,
  Info,
  ShieldCheck,
  Plus,
  Percent,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { WhatsAppCustomerRateCard } from "../whatsapp-billing.types";
import { useAdminCreateCustomerRateCard } from "../whatsapp-billing.queries";

interface CustomerPricingCardProps {
  rateCards?: WhatsAppCustomerRateCard[];
  isLoading: boolean;
  isAdmin?: boolean;
}

export const CustomerPricingCard: React.FC<CustomerPricingCardProps> = ({
  rateCards = [],
  isLoading,
  isAdmin = true,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"marketing" | "utility" | "authentication" | "service">("marketing");
  const [pricePaiseInput, setPricePaiseInput] = useState<number>(88);
  const [taxPercentInput, setTaxPercentInput] = useState<number>(18);
  const [taxModeInput, setTaxModeInput] = useState<"exclusive" | "inclusive">("exclusive");
  const [notesInput, setNotesInput] = useState<string>("");

  const createCardMutation = useAdminCreateCustomerRateCard();

  const handleOpenEdit = (category: "marketing" | "utility" | "authentication" | "service", currentPricePaise?: number) => {
    setSelectedCategory(category);
    setPricePaiseInput(currentPricePaise ?? 88);
    setShowEditModal(true);
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCardMutation.mutateAsync({
        category: selectedCategory,
        pricePaise: Number(pricePaiseInput),
        taxPercent: Number(taxPercentInput),
        taxMode: taxModeInput,
        notes: notesInput.trim() || undefined,
        workspaceId: "default",
      });
      setShowEditModal(false);
    } catch (err) {
      console.error("Failed to update customer price:", err);
    }
  };

  const categories = [
    { key: "marketing", label: "Marketing", desc: "Promotions, offers, announcements, and product updates", defaultPrice: "0.88" },
    { key: "utility", label: "Utility", desc: "Order alerts, shipping updates, account receipts, payment reminders", defaultPrice: "0.15" },
    { key: "authentication", label: "Authentication / OTP", desc: "One-time passwords, login codes, account verification", defaultPrice: "0.15" },
    { key: "service", label: "Service / Support", desc: "Customer care responses initiated within 24hr service window", defaultPrice: "0.35" },
  ] as const;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
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
              Independent customer pricing system. Meta provider rate changes do not mutate these configured selling prices.
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

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {categories.map((cat) => {
          const card = rateCards.find((c) => c.category === cat.key);
          const priceInr = card ? (card.pricePaise / 100).toFixed(2) : cat.defaultPrice;
          const pricePaise = card ? card.pricePaise : Math.round(parseFloat(cat.defaultPrice) * 100);
          const taxMode = card?.taxMode || "exclusive";
          const taxPercent = card?.taxPercent ?? 18;

          return (
            <div
              key={cat.key}
              className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {cat.label}
                </span>
                <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500 shadow-2xs dark:bg-slate-700 dark:text-slate-300">
                  {pricePaise} paise
                </span>
              </div>

              <div className="mt-3">
                <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  ₹{priceInr}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  per delivered message + {taxPercent}% GST ({taxMode})
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {cat.desc}
              </p>

              {isAdmin && (
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(cat.key, pricePaise)}
                    className="w-full text-xs font-medium h-8"
                  >
                    Configure Price
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
          NIWA charges customer wallets according to these configured selling prices. Meta wholesale costs are computed separately based on official Meta rate cards to calculate gross profitability and track wholesale expenses.
        </div>
      </div>

      {/* Edit Customer Price Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Update Selling Price: {selectedCategory.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure platform price in integer paise. Takes effect immediately.
            </p>

            <form onSubmit={handleSavePrice} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Price in Paise (e.g. 88 paise = ₹0.88)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={pricePaiseInput}
                  onChange={(e) => setPricePaiseInput(parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  Equals ₹{(pricePaiseInput / 100).toFixed(2)} per delivered message
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
                  Notes / Administrative Reference
                </label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. Rate card revision Q4 2026"
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
                  disabled={createCardMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                >
                  {createCardMutation.isPending ? "Saving..." : "Save Pricing Card"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
