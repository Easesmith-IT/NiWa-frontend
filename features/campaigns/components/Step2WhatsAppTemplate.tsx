"use client";

import React from "react";
import { ArrowLeft, ArrowRight, Smartphone, Loader2 } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { WhatsAppMessagePreview, MetaTemplate } from "./WhatsAppMessagePreview";
import { useWhatsAppConnections } from "../../whatsapp-connections/whatsapp-connections.queries";
import { useTemplates } from "../../templates/templates.queries";

interface Step2Props {
  connectionId: string;
  setConnectionId: (id: string) => void;
  templateId: string;
  setTemplateId: (id: string) => void;
  setSelectedTemplateObj: (template: MetaTemplate | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2WhatsAppTemplate: React.FC<Step2Props> = ({
  connectionId,
  setConnectionId,
  templateId,
  setTemplateId,
  setSelectedTemplateObj,
  onNext,
  onBack,
}) => {
  const [error, setError] = React.useState("");

  const connectionsQuery = useWhatsAppConnections();
  const templatesQuery = useTemplates();

  const activeConnections = connectionsQuery.data?.connections || [];
  const templates = templatesQuery.data?.templates || [];

  // Auto-select first connection if only one exists and none selected
  React.useEffect(() => {
    if (!connectionId && activeConnections.length > 0) {
      const firstConnected = activeConnections.find((c: any) => c.connectionStatus === "CONNECTED") || activeConnections[0];
      if (firstConnected) setConnectionId(firstConnected.id);
    }
  }, [activeConnections, connectionId, setConnectionId]);

  const selectedConnectionObj = activeConnections.find((c: any) => c.id === connectionId);
  const selectedTemplate = templates.find((t: any) => t._id === templateId) || null;

  React.useEffect(() => {
    setSelectedTemplateObj(selectedTemplate);
  }, [selectedTemplate, setSelectedTemplateObj]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectionId) {
      setError("Please select a WhatsApp connection.");
      return;
    }
    if (!templateId) {
      setError("Please select a Meta template.");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Smartphone className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Step 2: WhatsApp Connection & Template</h2>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Select your sending WhatsApp phone number and approved Meta template for this campaign.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Connection & Template Selection */}
        <div className="space-y-6 lg:col-span-7">
          {/* WhatsApp Connection Cards */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select WhatsApp Connection <span className="text-red-500">*</span>
            </label>
            {connectionsQuery.isLoading ? (
              <div className="flex items-center justify-center rounded-xl border bg-gray-50 py-8 text-xs text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-600" />
                Loading WhatsApp connections...
              </div>
            ) : activeConnections.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-800">
                <p className="font-semibold">No WhatsApp connections found.</p>
                <p className="mt-1 text-amber-700">
                  Go to <strong>Settings → WhatsApp Connection</strong> to link a Meta WhatsApp Business account.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {activeConnections.map((conn: any) => {
                  const isSelected = conn.id === connectionId;
                  const isConnected = conn.connectionStatus === "CONNECTED";

                  return (
                    <div
                      key={conn.id}
                      onClick={() => setConnectionId(conn.id)}
                      className={`relative cursor-pointer rounded-xl border p-3.5 transition-all ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {conn.displayPhoneNumber || conn.phoneNumberId}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {conn.verifiedName || conn.displayName || "WhatsApp Business"}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isConnected ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {conn.connectionStatus}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Meta Template Selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Meta Approved Template <span className="text-red-500">*</span>
            </label>
            {templatesQuery.isLoading ? (
              <div className="flex items-center justify-center rounded-xl border bg-gray-50 py-8 text-xs text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-600" />
                Loading Meta templates...
              </div>
            ) : templates.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-500">
                No templates synced yet. Go to Templates to sync with Meta.
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  required
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="" disabled>
                    -- Choose an approved template --
                  </option>
                  {templates.map((t: any) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.language}) {t.category ? `• ${t.category}` : ""}
                    </option>
                  ))}
                </select>

                {selectedTemplate && (
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                    <span className="font-medium">Language: {selectedTemplate.language}</span>
                    {selectedTemplate.category && (
                      <span className="rounded-md bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                        {selectedTemplate.category}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        </div>

        {/* Right Column: Live Message Preview */}
        <div className="lg:col-span-5">
          <div className="sticky top-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Live WhatsApp Preview</p>
            <WhatsAppMessagePreview
              template={selectedTemplate}
              senderName={selectedConnectionObj?.verifiedName || selectedConnectionObj?.displayName || "Easesmith IT"}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
          Continue to Audience
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};
