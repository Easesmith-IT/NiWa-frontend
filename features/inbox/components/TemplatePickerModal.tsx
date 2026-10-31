"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2,
  FileText,
  Search,
  Sparkles,
  X,
  Phone,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  Send,
  Loader2,
  MessageSquare
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useTemplates } from "../../templates/templates.queries";
import { useSendTemplateMessageMutation } from "../../messages/message.queries";
import type { TemplateRecord } from "../../../lib/api/types";
import { cn } from "../../../lib/utils";

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientPhone: string;
  contactName?: string;
  onSuccess?: () => void;
}

export function TemplatePickerModal({
  isOpen,
  onClose,
  recipientPhone,
  contactName = "",
  onSuccess,
}: TemplatePickerModalProps) {
  const { data: templatesData, isLoading: isLoadingTemplates } = useTemplates();
  const sendTemplateMutation = useSendTemplateMessageMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [bodyVarValues, setBodyVarValues] = useState<Record<number, string>>({});
  const [sendError, setSendError] = useState<string | null>(null);

  const templates: TemplateRecord[] = useMemo(() => {
    return (templatesData?.templates as TemplateRecord[]) || [];
  }, [templatesData]);

  // Approved and sendable templates
  const approvedTemplates = useMemo(() => {
    return templates.filter((t) => {
      const status = (t.status || "").toUpperCase();
      return status === "APPROVED" || status === "ACTIVE";
    });
  }, [templates]);

  // Filtered by search and category
  const filteredTemplates = useMemo(() => {
    return approvedTemplates.filter((t) => {
      const matchesCategory =
        selectedCategory === "ALL" ||
        (t.category || "").toUpperCase() === selectedCategory.toUpperCase();
      const matchesSearch =
        searchQuery.trim() === "" ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.bodyText || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [approvedTemplates, selectedCategory, searchQuery]);

  // Auto-select first template if none selected
  useEffect(() => {
    if (filteredTemplates.length > 0 && (!selectedTemplateId || !filteredTemplates.some(t => t._id === selectedTemplateId))) {
      setSelectedTemplateId(filteredTemplates[0]._id);
    }
  }, [filteredTemplates, selectedTemplateId]);

  const currentTemplate = useMemo(() => {
    return approvedTemplates.find((t) => t._id === selectedTemplateId) || filteredTemplates[0] || null;
  }, [approvedTemplates, filteredTemplates, selectedTemplateId]);

  // Determine required body variables count
  const requiredVarCount = useMemo(() => {
    if (!currentTemplate) return 0;
    if (typeof currentTemplate.bodyVariableCount === "number") {
      return currentTemplate.bodyVariableCount;
    }
    if (Array.isArray(currentTemplate.bodyVariables)) {
      return currentTemplate.bodyVariables.length;
    }
    const matches = (currentTemplate.bodyText || "").match(/\{\{(\d+)\}\}/g);
    return matches ? new Set(matches).size : 0;
  }, [currentTemplate]);

  // Initialize variable values with contactName for variable 1 when template changes
  useEffect(() => {
    const initial: Record<number, string> = {};
    for (let i = 1; i <= requiredVarCount; i++) {
      if (i === 1 && contactName) {
        initial[i] = contactName;
      } else {
        initial[i] = "";
      }
    }
    setBodyVarValues(initial);
    setSendError(null);
  }, [currentTemplate?._id, requiredVarCount, contactName]);

  // Generate rendered preview text
  const previewBody = useMemo(() => {
    if (!currentTemplate?.bodyText) return "";
    let rendered = currentTemplate.bodyText;
    for (let i = 1; i <= requiredVarCount; i++) {
      const val = bodyVarValues[i]?.trim();
      const replacement = val || `[Variable {{${i}}}]`;
      rendered = rendered.replace(new RegExp(`\\{\\{${i}\\}\\}`, "g"), replacement);
    }
    return rendered;
  }, [currentTemplate?.bodyText, requiredVarCount, bodyVarValues]);

  const handleSend = async () => {
    if (!currentTemplate) return;
    setSendError(null);

    // Validate that all required body variables are filled
    const varsArray: string[] = [];
    for (let i = 1; i <= requiredVarCount; i++) {
      const val = (bodyVarValues[i] || "").trim();
      if (!val) {
        setSendError(`Please provide a value for variable {{${i}}}`);
        return;
      }
      varsArray.push(val);
    }

    try {
      await sendTemplateMutation.mutateAsync({
        to: recipientPhone,
        templateName: currentTemplate.name,
        languageCode: currentTemplate.language || "en",
        bodyVariables: varsArray,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to dispatch template message via Meta Cloud API.";
      setSendError(msg);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white dark:bg-[#121416] border border-[#E4E4E7] dark:border-[#24272A] rounded-2xl shadow-2xl">
        <DialogTitle className="sr-only">Choose WhatsApp Message Template</DialogTitle>
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#E4E4E7] dark:border-[#24272A] px-6 py-4 bg-[#F8FAFC] dark:bg-[#15171A]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF8F3] text-[#176B4D] dark:bg-[#15271F] dark:text-[#63B592]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Reconnect with {contactName || recipientPhone}
              </h2>
              <p className="text-xs text-muted-foreground">
                Select an approved WhatsApp template to restart the 24-hour conversation window.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-[#F1F5F9] hover:text-foreground dark:hover:bg-[#1E2024] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2-Column Responsive Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px] max-h-[75vh]">
          {/* Left Column: Template Selection & Variables (7 cols) */}
          <div className="lg:col-span-7 flex flex-col border-r border-[#E4E4E7] dark:border-[#24272A] p-5 overflow-y-auto space-y-4">
            {/* Search & Category Filter */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search approved templates..."
                  className="pl-9 text-xs h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {["ALL", "UTILITY", "MARKETING", "AUTHENTICATION"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
                      selectedCategory === cat
                        ? "bg-[#176B4D] text-white"
                        : "bg-[#F1F5F9] dark:bg-[#1E2024] text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cat === "ALL" ? "All Templates" : cat.charAt(0) + cat.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Cards List */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {isLoadingTemplates ? (
                <div className="flex items-center justify-center py-8 text-xs text-muted-foreground gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#176B4D]" />
                  Loading approved WhatsApp templates...
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="p-4 text-center rounded-xl border border-dashed border-[#E4E4E7] dark:border-[#24272A] text-xs text-muted-foreground">
                  No approved templates match your search.
                </div>
              ) : (
                filteredTemplates.map((template) => {
                  const isSelected = template._id === currentTemplate?._id;
                  return (
                    <div
                      key={template._id}
                      onClick={() => setSelectedTemplateId(template._id)}
                      className={cn(
                        "p-3 rounded-xl border text-left cursor-pointer transition-all duration-150",
                        isSelected
                          ? "border-[#176B4D] bg-[#EDF8F3]/50 dark:border-[#3B9B77] dark:bg-[#15271F]/50 shadow-sm"
                          : "border-[#E4E4E7] dark:border-[#24272A] hover:bg-[#F8FAFC] dark:hover:bg-[#191C1E]"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isSelected ? (
                            <CheckCircle2 className="h-4 w-4 text-[#176B4D] shrink-0" />
                          ) : (
                            <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground shrink-0" />
                          )}
                          <p className="text-xs font-bold text-foreground truncate">
                            {template.name.replace(/_/g, " ")}
                          </p>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-[#176B4D] dark:bg-[#1E3B2E] dark:text-[#63B592]">
                          {template.category || "Utility"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {template.bodyText}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Dynamic Variable Customization Fields */}
            {currentTemplate && requiredVarCount > 0 && (
              <div className="pt-2 border-t border-[#E4E4E7] dark:border-[#24272A] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#176B4D]" />
                    Template Fields ({requiredVarCount})
                  </h4>
                  <span className="text-[10px] text-muted-foreground">
                    Auto-mapped from customer record
                  </span>
                </div>

                <div className="space-y-2">
                  {Array.from({ length: requiredVarCount }, (_, idx) => {
                    const varNum = idx + 1;
                    const isNameVar = varNum === 1 && contactName;
                    return (
                      <div key={varNum} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <label className="font-semibold text-foreground flex items-center gap-1">
                            Variable {`{{${varNum}}}`}
                            {isNameVar && (
                              <span className="text-[10px] text-[#176B4D] font-medium bg-[#EDF8F3] px-1.5 rounded">
                                Customer Name
                              </span>
                            )}
                          </label>
                        </div>
                        <Input
                          className="h-8 text-xs"
                          placeholder={`Enter value for {{${varNum}}}...`}
                          value={bodyVarValues[varNum] || ""}
                          onChange={(e) =>
                            setBodyVarValues((prev) => ({
                              ...prev,
                              [varNum]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error Message */}
            {sendError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{sendError}</span>
              </div>
            )}
          </div>

          {/* Right Column: Live Smartphone Preview (5 cols) */}
          <div className="lg:col-span-5 bg-[#F8FAFC] dark:bg-[#15171A] p-5 flex flex-col justify-between items-center border-t lg:border-t-0 border-[#E4E4E7] dark:border-[#24272A]">
            <div className="w-full max-w-[320px]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center mb-3">
                Live WhatsApp Smartphone Preview
              </p>

              {/* Realistic Phone Card Frame */}
              <div className="rounded-2xl border-4 border-slate-300 dark:border-slate-700 bg-[#E5DDD5] dark:bg-[#0B141A] shadow-lg overflow-hidden flex flex-col">
                {/* Phone Top Header */}
                <div className="bg-[#075E54] text-white px-3 py-2 flex items-center gap-2 shadow-sm">
                  <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                    NW
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate leading-tight flex items-center gap-1">
                      NiWa Support
                      <ShieldCheck className="h-3 w-3 text-emerald-300 inline" />
                    </p>
                    <p className="text-[9px] text-emerald-100 opacity-90 truncate">Online</p>
                  </div>
                </div>

                {/* Chat Bubble Area */}
                <div className="p-3 min-h-[220px] flex flex-col justify-end">
                  {currentTemplate ? (
                    <div className="bg-white dark:bg-[#1F2C34] text-slate-900 dark:text-slate-100 p-3 rounded-xl rounded-tl-xs shadow-md space-y-2 text-xs border border-black/5">
                      {/* Header (if any) */}
                      {currentTemplate.headerText && (
                        <p className="font-bold text-xs text-foreground border-b border-slate-100 pb-1">
                          {currentTemplate.headerText}
                        </p>
                      )}

                      {/* Rendered Body Text */}
                      <p className="whitespace-pre-wrap leading-relaxed text-[11px]">
                        {previewBody || currentTemplate.bodyText}
                      </p>

                      {/* Footer Text */}
                      {currentTemplate.footerText && (
                        <p className="text-[10px] text-muted-foreground pt-1 border-t border-slate-100 dark:border-slate-800">
                          {currentTemplate.footerText}
                        </p>
                      )}

                      {/* Message meta */}
                      <div className="flex items-center justify-end gap-1 text-[9px] text-muted-foreground mt-1">
                        <span>Just now</span>
                        <span className="text-[#53BDEB] font-bold">✓✓</span>
                      </div>

                      {/* Buttons (if any) */}
                      {currentTemplate.urlButtons && currentTemplate.urlButtons.length > 0 && (
                        <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
                          {currentTemplate.urlButtons.map((btn, i) => (
                            <div
                              key={i}
                              className="text-center text-[11px] font-semibold text-[#00A884] py-1 bg-slate-50 dark:bg-slate-800/50 rounded flex items-center justify-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {btn.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-xs text-muted-foreground py-10">
                      Select a template to preview.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reassurance & Free Tier Note */}
            <div className="w-full mt-4 p-2.5 rounded-xl bg-emerald-50 dark:bg-[#15271F] border border-emerald-200 dark:border-emerald-800 text-[11px] text-[#176B4D] dark:text-[#63B592] flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Protected by 1,000 Free Monthly Replies</p>
                <p className="text-[10px] opacity-90 mt-0.5">
                  Sending this template costs ₹0.00 from your free tier allowance and unlocks free-form replies once customer answers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between border-t border-[#E4E4E7] dark:border-[#24272A] px-6 py-3.5 bg-[#F8FAFC] dark:bg-[#15171A]">
          <div className="text-xs text-muted-foreground">
            Recipient: <span className="font-semibold font-mono text-foreground">{recipientPhone}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={sendTemplateMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSend}
              disabled={!currentTemplate || sendTemplateMutation.isPending}
              className="gap-2 bg-[#176B4D] hover:bg-[#135940] text-white"
            >
              {sendTemplateMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Sending via WhatsApp...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Send WhatsApp Template
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
