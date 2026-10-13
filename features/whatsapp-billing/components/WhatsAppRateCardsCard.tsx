"use client";

import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { WhatsAppRateCard } from "../whatsapp-billing.types";

interface WhatsAppRateCardsCardProps {
  rateCards: WhatsAppRateCard[];
  isLoading: boolean;
  onCreateRateCard?: (card: Partial<WhatsAppRateCard>) => Promise<void>;
}

export const WhatsAppRateCardsCard: React.FC<WhatsAppRateCardsCardProps> = ({
  rateCards,
  isLoading,
  onCreateRateCard,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [category, setCategory] = useState<"marketing" | "utility" | "authentication" | "service">("marketing");
  const [metaRate, setMetaRate] = useState<number>(0.8631);
  const [markupPercent, setMarkupPercent] = useState<number>(0);
  const [sellingRate, setSellingRate] = useState<number>(0.8631);
  const [countryCode, setCountryCode] = useState<string>("IN");
  const [verificationStatus, setVerificationStatus] = useState<
    "verified_official" | "provisional_secondary" | "unverified"
  >("provisional_secondary");
  const [source, setSource] = useState<string>("Secondary Pricing Summary (1 Oct 2026)");

  const handleMetaRateChange = (val: number) => {
    setMetaRate(val);
    const calculated = val * (1 + markupPercent / 100);
    setSellingRate(Number(calculated.toFixed(4)));
  };

  const handleMarkupChange = (val: number) => {
    setMarkupPercent(val);
    const calculated = metaRate * (1 + val / 100);
    setSellingRate(Number(calculated.toFixed(4)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreateRateCard) return;

    await onCreateRateCard({
      name: `${countryCode} ${category.toUpperCase()} Rate`,
      category,
      countryCode,
      currency: "INR",
      effectiveFrom: new Date().toISOString(),
      metaRate,
      sellingRate,
      markupPercent,
      pricingBasis: "on_delivery",
      freeAllowanceEligible: category === "service",
      verificationStatus,
      source,
      isActive: true,
    });

    setShowAddForm(false);
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "verified_official":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <ShieldCheck className="h-3 w-3" />
            Verified Official
          </span>
        );
      case "provisional_secondary":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <Clock className="h-3 w-3" />
            Provisional (Secondary)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            <ShieldAlert className="h-3 w-3" />
            Unverified
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Tag className="h-4 w-4 text-emerald-600" />
            Configured Rate Cards & Pricing Rules
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Effective-dated rate cards. Meta wholesale cost is maintained strictly separate from customer selling price.
          </p>
        </div>

        {onCreateRateCard && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            {showAddForm ? "Cancel" : "Add Rate Card"}
          </Button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-50/70 border-b border-slate-200 dark:bg-slate-850 dark:border-slate-800 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="mt-1 h-8 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="marketing">Marketing</option>
                <option value="utility">Utility</option>
                <option value="authentication">Authentication</option>
                <option value="service">Service</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Country Code</label>
              <input
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                className="mt-1 h-8 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs uppercase dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Meta Cost Rate (₹)</label>
              <input
                type="number"
                step="0.0001"
                value={metaRate}
                onChange={(e) => handleMetaRateChange(Number(e.target.value))}
                className="mt-1 h-8 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Customer Price (₹)</label>
              <input
                type="number"
                step="0.0001"
                value={sellingRate}
                onChange={(e) => setSellingRate(Number(e.target.value))}
                className="mt-1 h-8 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Rate Card
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Market</th>
              <th className="px-4 py-3 text-right">Meta Cost</th>
              <th className="px-4 py-3 text-right">Customer Price</th>
              <th className="px-4 py-3">Free Allowance</th>
              <th className="px-4 py-3">Verification</th>
              <th className="px-4 py-3">Effective From</th>
              <th className="px-4 py-3">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Loading rate cards...
                </td>
              </tr>
            ) : rateCards.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No rate cards configured.
                </td>
              </tr>
            ) : (
              rateCards.map((rc) => (
                <tr key={rc._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-semibold uppercase text-slate-900 dark:text-slate-100">
                    {rc.category}
                  </td>
                  <td className="px-4 py-3 font-mono font-medium">
                    {rc.countryCode === "*" ? "Global (*)" : rc.countryCode}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                    ₹{rc.metaRate.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    ₹{rc.sellingRate.toFixed(4)}
                    {rc.markupPercent > 0 && (
                      <span className="ml-1 text-[10px] text-emerald-600">
                        (+{rc.markupPercent}%)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {rc.freeAllowanceEligible ? (
                      <span className="rounded-xs bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                        Eligible (1k free)
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Chargeable</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {getVerificationBadge(rc.verificationStatus)}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-[11px]">
                    {new Date(rc.effectiveFrom).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-500 max-w-[180px] truncate">
                    {rc.source}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
