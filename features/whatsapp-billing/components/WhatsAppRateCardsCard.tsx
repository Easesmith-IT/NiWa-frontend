"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  FileCheck,
  Layers,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Tag,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { WhatsAppRateCard, RateVerificationStatus } from "../whatsapp-billing.types";
import { useVerifyWhatsAppRateCard, useRevokeWhatsAppRateCard, useDeactivateWhatsAppRateCard } from "../whatsapp-billing.queries";

interface WhatsAppRateCardsCardProps {
  rateCards: WhatsAppRateCard[];
  isLoading: boolean;
  workspaceId?: string;
  onCreateRateCard?: (card: Partial<WhatsAppRateCard>) => Promise<void>;
}

export const WhatsAppRateCardsCard: React.FC<WhatsAppRateCardsCardProps> = ({
  rateCards,
  isLoading,
  workspaceId = "default",
  onCreateRateCard,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [category, setCategory] = useState<"marketing" | "utility" | "authentication" | "service">("marketing");
  const [metaRate, setMetaRate] = useState<number>(0.8631);
  const [countryCode, setCountryCode] = useState<string>("IN");
  const [effectiveFromInput, setEffectiveFromInput] = useState<string>(new Date().toISOString().slice(0, 10));
  const [source, setSource] = useState<string>("Meta Published Pricing (1 Oct 2026)");

  // Modals state
  const [selectedCardForVerify, setSelectedCardForVerify] = useState<WhatsAppRateCard | null>(null);
  const [selectedCardForRevoke, setSelectedCardForRevoke] = useState<WhatsAppRateCard | null>(null);
  const [selectedCardForEvidence, setSelectedCardForEvidence] = useState<WhatsAppRateCard | null>(null);

  // Form states for Verify
  const [verifyMode, setVerifyMode] = useState<"trusted" | "retained">("trusted");
  const [verifySourceUrl, setVerifySourceUrl] = useState<string>("https://developers.facebook.com/docs/whatsapp/pricing");
  const [verifyEvidenceRef, setVerifyEvidenceRef] = useState<string>("");
  const [verifyReason, setVerifyReason] = useState<string>("");
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Form state for Revoke
  const [revokeReason, setRevokeReason] = useState<string>("");
  const [revokeError, setRevokeError] = useState<string | null>(null);

  // Copy state for evidence
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);

  const verifyMutation = useVerifyWhatsAppRateCard();
  const revokeMutation = useRevokeWhatsAppRateCard();
  const deactivateMutation = useDeactivateWhatsAppRateCard();

  const handleMetaRateChange = (val: number) => setMetaRate(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreateRateCard) return;

    await onCreateRateCard({
      name: `${countryCode} ${category.toUpperCase()} Rate`,
      category,
      countryCode,
      currency: "INR",
      effectiveFrom: new Date(effectiveFromInput).toISOString(),
      metaRate,
      markupPercent: 0,
      pricingBasis: category === "service" ? "on_chargeable_reply" : "on_delivery",
      freeAllowanceEligible: category === "service",
      source,
      isActive: true,
    });

    setShowAddForm(false);
  };

  const openVerifyModal = (card: WhatsAppRateCard) => {
    setSelectedCardForVerify(card);
    setVerifyMode("trusted");
    setVerifySourceUrl(card.verificationEvidence?.sourceUrl || "https://developers.facebook.com/docs/whatsapp/pricing");
    setVerifyEvidenceRef(card.verificationEvidence?.evidenceRef || `meta_pricing_${card.category}_rates_20261001`);
    setVerifyReason(`Verified official Meta WhatsApp Business Platform published rate for ${card.category} (India market, INR)`);
    setVerifyError(null);
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardForVerify) return;

    if (!verifyReason.trim() || verifyReason.trim().length < 10) {
      setVerifyError("A substantive approval reason (at least 10 characters) is required.");
      return;
    }

    try {
      setVerifyError(null);
      await verifyMutation.mutateAsync({
        rateCardId: selectedCardForVerify._id,
        workspaceId,
        payload: {
          sourceUrl: verifySourceUrl.trim(),
          trustedRetrieval: verifyMode === "trusted",
          approvalReason: verifyReason.trim(),
          evidenceRef: verifyMode === "retained" ? verifyEvidenceRef.trim() : undefined,
          metaRate: selectedCardForVerify.metaRate,
          category: selectedCardForVerify.category,
          countryCode: selectedCardForVerify.countryCode,
          currency: selectedCardForVerify.currency,
          pricingBasis: selectedCardForVerify.pricingBasis,
          effectiveFrom: selectedCardForVerify.effectiveFrom,
          effectiveTo: selectedCardForVerify.effectiveTo,
          revision: "2026-10-01",
        },
      });
      setSelectedCardForVerify(null);
    } catch (err: any) {
      setVerifyError(err?.response?.data?.message || err?.message || "Verification failed");
    }
  };

  const openRevokeModal = (card: WhatsAppRateCard) => {
    setSelectedCardForRevoke(card);
    setRevokeReason("");
    setRevokeError(null);
  };

  const handleRevokeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardForRevoke) return;

    if (!revokeReason.trim() || revokeReason.trim().length < 5) {
      setRevokeError("A revocation reason (at least 5 characters) is required.");
      return;
    }

    try {
      setRevokeError(null);
      await revokeMutation.mutateAsync({
        rateCardId: selectedCardForRevoke._id,
        workspaceId,
        payload: {
          reason: revokeReason.trim(),
        },
      });
      setSelectedCardForRevoke(null);
    } catch (err: any) {
      setRevokeError(err?.response?.data?.message || err?.message || "Revocation failed");
    }
  };

  const copyToClipboard = (text: string, type: "hash" | "fingerprint") => {
    navigator.clipboard.writeText(text);
    if (type === "hash") {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedFingerprint(true);
      setTimeout(() => setCopiedFingerprint(false), 2000);
    }
  };

  const getVerificationBadge = (status: RateVerificationStatus | string) => {
    switch (status) {
      case "verified_official":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <ShieldCheck className="h-3 w-3" />
            Verified Official
          </span>
        );
      case "evidence_validated":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            <FileCheck className="h-3 w-3" />
            Evidence Validated
          </span>
        );
      case "provisional_secondary":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <Clock className="h-3 w-3" />
            Provisional (Secondary)
          </span>
        );
      case "revoked":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-semibold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            <XCircle className="h-3 w-3" />
            Revoked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            <ShieldAlert className="h-3 w-3" />
            Unverified
          </span>
        );
    }
  };

  const getEligibilityBadge = (card: WhatsAppRateCard) => {
    const isEligible = card.verificationStatus === "verified_official" && card.isActive;
    if (isEligible) {
      return (
        <span className="inline-flex items-center gap-1 rounded-sm bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-2.5 w-2.5" />
          Chargeable
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-sm bg-slate-50 border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-400">
        Non-Chargeable
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Tag className="h-4 w-4 text-emerald-600" />
            Configured Rate Cards & Primary-Source Verification
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Meta/provider cost schedule only. NIWA customer selling prices are configured separately. Only verified official rate cards with retained Meta documentation can be used for provider-cost resolution.
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
          <div className="rounded-md bg-blue-50/60 border border-blue-200 p-2.5 text-xs text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Verification Requirement</p>
              <p className="text-[11px] text-blue-700 dark:text-blue-400">
                New rate cards are created with status <strong>Unverified</strong>. A platform administrator must verify rates against official Meta pricing documentation before they can be used for provider-cost resolution. Customer selling prices are managed separately.
              </p>
            </div>
          </div>

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
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Effective From</label>
              <input type="date" value={effectiveFromInput} onChange={(e) => setEffectiveFromInput(e.target.value)} className="mt-1 h-8 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-800" />
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
              
              <th className="px-4 py-3">Meta Free Tier</th>
              <th className="px-4 py-3">Verification</th>
              <th className="px-4 py-3">Eligibility</th>
              <th className="px-4 py-3">Effective Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
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
                  <td className="px-4 py-3">
                    {rc.freeAllowanceEligible ? (
                      <span className="rounded-xs bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                        Meta tier eligible
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Chargeable</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {getVerificationBadge(rc.verificationStatus)}
                  </td>
                  <td className="px-4 py-3">
                    {getEligibilityBadge(rc)}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-[11px]">
                    {new Date(rc.effectiveFrom).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {rc.verificationEvidence && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedCardForEvidence(rc)}
                          className="h-7 px-2 text-[11px] text-slate-600 hover:text-slate-900 dark:text-slate-400"
                          title="Inspect Evidence"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Evidence
                        </Button>
                      )}

                      {rc.isActive && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={deactivateMutation.isPending}
                          onClick={async () => {
                            if (!window.confirm("Deactivate this provider-rate schedule? New sends will fail closed if no replacement is active.")) return;
                            await deactivateMutation.mutateAsync({
                              rateCardId: rc._id,
                              workspaceId,
                              reason: "Deactivated by platform administrator",
                            });
                          }}
                          className="h-7 px-2 text-[11px] text-rose-600 hover:text-rose-700"
                          title="Deactivate provider rate schedule"
                        >
                          Deactivate
                        </Button>
                      )}

                      {rc.verificationStatus === "verified_official" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRevokeModal(rc)}
                          className="h-7 px-2 text-[11px] text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/40"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Revoke
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openVerifyModal(rc)}
                          className="h-7 px-2 text-[11px] text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950/40 font-semibold"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                          Verify
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Verification Modal */}
      {selectedCardForVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Verify WhatsApp Rate Card
              </h4>
              <button
                onClick={() => setSelectedCardForVerify(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-md bg-slate-50 p-3 text-xs dark:bg-slate-850 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Category & Market:</span>
                <span className="font-semibold uppercase text-slate-900 dark:text-slate-100">
                  {selectedCardForVerify.category} ({selectedCardForVerify.countryCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Claimed Meta Wholesale Rate:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  ₹{selectedCardForVerify.metaRate.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pricing Basis:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {selectedCardForVerify.pricingBasis}
                </span>
              </div>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Verification Source Mode</label>
                <div className="mt-1 flex gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="verifyMode"
                      value="trusted"
                      checked={verifyMode === "trusted"}
                      onChange={() => setVerifyMode("trusted")}
                    />
                    <span>Trusted Server Retrieval (Fetch from Meta)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="verifyMode"
                      value="retained"
                      checked={verifyMode === "retained"}
                      onChange={() => setVerifyMode("retained")}
                    />
                    <span>Retained Evidence Reference</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Meta Documentation Source URL</label>
                <input
                  type="url"
                  required
                  value={verifySourceUrl}
                  onChange={(e) => setVerifySourceUrl(e.target.value)}
                  className="mt-1 h-8 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              {verifyMode === "retained" && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Retained Evidence Reference (evidenceRef)</label>
                  <input
                    type="text"
                    required
                    value={verifyEvidenceRef}
                    onChange={(e) => setVerifyEvidenceRef(e.target.value)}
                    className="mt-1 h-8 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800"
                    placeholder="e.g. meta_pricing_india_rates_20261001"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Backend will verify this retained artifact already exists in storage with matching SHA-256 integrity and trusted provenance.
                  </p>
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Administrative Approval Reason (min. 10 chars)
                </label>
                <textarea
                  required
                  rows={2}
                  value={verifyReason}
                  onChange={(e) => setVerifyReason(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  placeholder="Detail the authoritative source document, revision, and market alignment..."
                />
              </div>

              {verifyError && (
                <div className="rounded-md bg-rose-50 p-2.5 text-xs text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{verifyError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCardForVerify(null)}
                  disabled={verifyMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={verifyMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {verifyMutation.isPending ? (
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    "Authorize & Activate Verification"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revocation Modal */}
      {selectedCardForRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h4 className="text-sm font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-600" />
                Revoke Rate Card Verification
              </h4>
              <button
                onClick={() => setSelectedCardForRevoke(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
              <p className="font-semibold">Charging Ineligibility Warning</p>
              <p className="text-[11px] mt-1">
                Revoking this card immediately prevents it from being resolved for new message charges.
                Historical finalized usage records and ledger entries remain immutable and unaffected.
              </p>
            </div>

            <form onSubmit={handleRevokeSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Revocation Reason (min. 5 chars)
                </label>
                <textarea
                  required
                  rows={2}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  placeholder="e.g. Superseded by newer revision, contested rate, or administrative withdrawal..."
                />
              </div>

              {revokeError && (
                <div className="rounded-md bg-rose-50 p-2.5 text-xs text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{revokeError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCardForRevoke(null)}
                  disabled={revokeMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={revokeMutation.isPending}
                >
                  {revokeMutation.isPending ? "Revoking..." : "Confirm Revocation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evidence Inspection Modal */}
      {selectedCardForEvidence && selectedCardForEvidence.verificationEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-emerald-600" />
                Retained Primary-Source Evidence
              </h4>
              <button
                onClick={() => setSelectedCardForEvidence(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Verification Status:</span>
                <span>{getVerificationBadge(selectedCardForEvidence.verificationStatus)}</span>
              </div>

              <div>
                <span className="text-slate-500 font-medium">Source Document URL:</span>
                <div className="mt-1 flex items-center gap-2 bg-slate-50 p-2 rounded-md font-mono text-[11px] text-slate-800 dark:bg-slate-850 dark:text-slate-200 break-all">
                  <a
                    href={selectedCardForEvidence.verificationEvidence.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {selectedCardForEvidence.verificationEvidence.sourceUrl}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Retained Evidence Reference:</span>
                </div>
                <div className="mt-1 bg-slate-50 p-2 rounded-md font-mono text-[11px] text-slate-800 dark:bg-slate-850 dark:text-slate-200">
                  {selectedCardForEvidence.verificationEvidence.evidenceRef}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Artifact SHA-256 Byte Hash:</span>
                  <button
                    onClick={() => copyToClipboard(selectedCardForEvidence.verificationEvidence!.evidenceHash, "hash")}
                    className="text-[10px] text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    {copiedHash ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedHash ? "Copied" : "Copy Hash"}
                  </button>
                </div>
                <div className="mt-1 bg-slate-50 p-2 rounded-md font-mono text-[10px] text-slate-800 dark:bg-slate-850 dark:text-slate-200 break-all select-all">
                  {selectedCardForEvidence.verificationEvidence.evidenceHash}
                </div>
              </div>

              {selectedCardForEvidence.verificationEvidence.snapshotFingerprint && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Immutable Snapshot Fingerprint:</span>
                    <button
                      onClick={() => copyToClipboard(selectedCardForEvidence.verificationEvidence!.snapshotFingerprint!, "fingerprint")}
                      className="text-[10px] text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copiedFingerprint ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedFingerprint ? "Copied" : "Copy Fingerprint"}
                    </button>
                  </div>
                  <div className="mt-1 bg-slate-50 p-2 rounded-md font-mono text-[10px] text-slate-800 dark:bg-slate-850 dark:text-slate-200 break-all select-all">
                    {selectedCardForEvidence.verificationEvidence.snapshotFingerprint}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1 border-t dark:border-slate-800">
                <div>
                  <span className="text-slate-500 text-[11px]">Verified By:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedCardForEvidence.verificationEvidence.verifiedBy}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Verified At:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(selectedCardForEvidence.verificationEvidence.verifiedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] font-medium">Approval Reason:</span>
                <p className="mt-1 p-2 bg-slate-50 rounded-md text-[11px] text-slate-700 dark:bg-slate-850 dark:text-slate-300 italic">
                  &ldquo;{selectedCardForEvidence.verificationEvidence.reason}&rdquo;
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t dark:border-slate-800">
              <Button size="sm" variant="outline" onClick={() => setSelectedCardForEvidence(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
