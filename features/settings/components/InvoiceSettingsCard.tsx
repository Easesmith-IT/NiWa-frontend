"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { queryKeys } from "lib/api/query-keys";
import {
  getInvoiceSettings,
  updateInvoiceSettings,
  WorkspaceInvoiceSettings,
} from "lib/api/sales-api";
import { Building2, CreditCard, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export const InvoiceSettingsCard: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: queryKeys.invoiceSettings,
    queryFn: getInvoiceSettings,
  });

  const [formData, setFormData] = useState<Partial<WorkspaceInvoiceSettings>>({});
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData({
        businessName: settings.businessName || "",
        address: settings.address || "",
        email: settings.email || "",
        phone: settings.phone || "",
        taxId: settings.taxId || "",
        website: settings.website || "",
        bankName: settings.bankName || "",
        accountHolderName: settings.accountHolderName || "",
        accountNumber: settings.accountNumber || "",
        ifscOrRoutingCode: settings.ifscOrRoutingCode || "",
        swiftCode: settings.swiftCode || "",
        upiId: settings.upiId || "",
        paymentTerms: settings.paymentTerms || "",
        paymentNotes: settings.paymentNotes || "",
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (payload: Partial<WorkspaceInvoiceSettings>) => updateInvoiceSettings(payload),
    onSuccess: (updated) => {
      setSaveSuccess("Invoice & payment settings saved successfully.");
      setSaveError(null);
      queryClient.setQueryData(queryKeys.invoiceSettings, updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.invoiceSettings });
      setTimeout(() => setSaveSuccess(null), 4000);
    },
    onError: (err: any) => {
      setSaveError(err.response?.data?.error?.message || err.message || "Failed to save settings");
      setSaveSuccess(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(null);
    setSaveError(null);
    mutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-xs text-muted-foreground animate-pulse">Loading invoice settings...</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-6 p-6">
      <div className="border-b border-[#F0F0F2] pb-3 dark:border-[#202326]">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          <h2 className="text-sm font-semibold text-foreground">Invoice & Commercial Presentation Settings</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Configure authoritative workspace identity, official tax credentials, and bank/UPI payment instructions displayed on commercial invoices and printable PDFs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Business Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            <Building2 className="w-4 h-4 text-neutral-500" />
            <span>Business Entity Information</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Business / Legal Entity Name</label>
              <Input
                placeholder="e.g. Acme Technologies Ltd"
                value={formData.businessName || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Tax ID / GSTIN / VAT</label>
              <Input
                placeholder="e.g. 29AAAAA0000A1Z5"
                value={formData.taxId || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, taxId: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Official Billing Email</label>
              <Input
                type="email"
                placeholder="billing@acme.com"
                value={formData.email || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Phone Number</label>
              <Input
                placeholder="+1 555 0199"
                value={formData.phone || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-foreground">Website</label>
              <Input
                placeholder="https://www.acme.com"
                value={formData.website || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-xs font-medium text-foreground">Registered Business Address</label>
              <Input
                placeholder="123 Market Street, Suite 400, San Francisco, CA 94103, USA"
                value={formData.address || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Payment Instructions & Banking */}
        <div className="space-y-4 pt-2 border-t border-[#F0F0F2] dark:border-[#202326]">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            <CreditCard className="w-4 h-4 text-neutral-500" />
            <span>Bank Account & Payment Instructions</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Bank Name</label>
              <Input
                placeholder="e.g. JPMorgan Chase / HDFC Bank"
                value={formData.bankName || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, bankName: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Account Holder / Payee</label>
              <Input
                placeholder="Acme Technologies Ltd"
                value={formData.accountHolderName || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, accountHolderName: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Account Number / IBAN</label>
              <Input
                placeholder="Account number or IBAN"
                value={formData.accountNumber || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Routing / IFSC Code</label>
              <Input
                placeholder="Routing Number or IFSC"
                value={formData.ifscOrRoutingCode || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, ifscOrRoutingCode: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">SWIFT / BIC</label>
              <Input
                placeholder="SWIFT code for wire transfers"
                value={formData.swiftCode || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, swiftCode: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">UPI ID / VPA</label>
              <Input
                placeholder="business@bank"
                value={formData.upiId || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, upiId: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Invoice Terms & Policies */}
        <div className="space-y-4 pt-2 border-t border-[#F0F0F2] dark:border-[#202326]">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            <FileText className="w-4 h-4 text-neutral-500" />
            <span>Default Terms & Payment Conditions</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Payment Terms Text</label>
              <Input
                placeholder="e.g. Net 30 days upon receipt"
                value={formData.paymentTerms || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, paymentTerms: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Customer / Payment Notes</label>
              <Textarea
                rows={2}
                placeholder="e.g. Please include invoice number in wire transfer reference."
                value={formData.paymentNotes || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, paymentNotes: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Status Messages and Save Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F0F0F2] dark:border-[#202326]">
          <div>
            {saveSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>{saveSuccess}</span>
              </div>
            )}
            {saveError && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>{saveError}</span>
              </div>
            )}
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={mutation.isPending}
            className="cursor-pointer"
          >
            {mutation.isPending ? "Saving..." : "Save Invoice Settings"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
