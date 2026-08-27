"use client";

import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Settings,
  Smartphone,
  X,
  ChevronRight,
  Activity,
  Zap,
  FileText,
  Layers,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { MetaEmbeddedSignup } from "../../components/whatsapp/MetaEmbeddedSignup";
import { useWhatsAppSettingsState } from "./hooks/useWhatsAppSettingsState";
import { WhatsAppConnectionDetailsModal } from "./components/WhatsAppConnectionDetailsModal";
import { WhatsAppDisconnectModal } from "./components/WhatsAppDisconnectModal";

export const WhatsAppSettingsModule: React.FC = () => {
  const {
    isDetailOpen,
    setIsDetailOpen,
    selectedConnection,
    setSelectedConnection,
    isDisconnectModalOpen,
    setIsDisconnectModalOpen,
    actionFeedback,
    setActionFeedback,
    connectionsQuery,
    activeConnection,
    syncMutation,
    disconnectMutation,
    handleSync,
    handleDisconnect,
    formatDate,
  } = useWhatsAppSettingsState();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            WhatsApp Account & Connections
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Connect and manage the WhatsApp Business accounts used by your workspace.
          </p>
        </div>

        {activeConnection && activeConnection.connectionStatus === "CONNECTED" && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSync(activeConnection.id)}
              disabled={syncMutation.isPending}
              className="text-xs gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncMutation.isPending ? "animate-spin" : ""}`} />
              {syncMutation.isPending ? "Syncing..." : "Sync Now"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedConnection(activeConnection);
                setIsDetailOpen(true);
              }}
              className="text-xs gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              Manage Connection
            </Button>
          </div>
        )}
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between gap-2 ${
            actionFeedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {connectionsQuery.isLoading ? (
        <Card className="p-8 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading WhatsApp connection status...</p>
        </Card>
      ) : !activeConnection || activeConnection.connectionStatus === "DISCONNECTED" ? (
        /* Empty State */
        <Card className="p-8 border-dashed border-2 border-slate-200 dark:border-slate-800 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-inner">
            <Smartphone className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Connect WhatsApp to NiWa
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Connect your WhatsApp Business account using Meta Embedded Signup to manage conversations, templates, automations, and customer communication directly within NiWa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-200">Shared Workspace Inbox</span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Send and receive customer messages seamlessly.</p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-200">Template Sync & Broadcasts</span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Automatically sync Meta approved templates.</p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <MetaEmbeddedSignup
              onSuccess={(conn) => {
                setActionFeedback({ type: "success", message: `Connected ${conn.displayName || "WhatsApp Account"}!` });
                connectionsQuery.refetch();
              }}
            />
          </div>
        </Card>
      ) : (
        /* Connected Account Card */
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                WA
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {activeConnection.displayName || activeConnection.verifiedName || "WhatsApp Business"}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
                    {activeConnection.connectionStatus}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  {activeConnection.displayPhoneNumber || activeConnection.phoneNumberId}
                </p>
                {activeConnection.verifiedName && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Verified Name: {activeConnection.verifiedName}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedConnection(activeConnection);
                  setIsDetailOpen(true);
                }}
                className="text-xs gap-1.5"
              >
                Manage
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Services Status Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                <span>Messaging</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 capitalize">
                {activeConnection.messagingStatus}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                <span>Webhooks</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 capitalize">
                {activeConnection.webhookStatus}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>Templates</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 capitalize">
                {activeConnection.templateSyncStatus}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                <span>Last Sync</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {formatDate(activeConnection.lastSyncedAt)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Detail Drawer / Modal */}
      <WhatsAppConnectionDetailsModal
        isOpen={isDetailOpen}
        selectedConnection={selectedConnection}
        onClose={() => setIsDetailOpen(false)}
        onOpenDisconnectModal={() => setIsDisconnectModalOpen(true)}
        formatDate={formatDate}
      />

      {/* Disconnect Confirmation Modal */}
      <WhatsAppDisconnectModal
        isOpen={isDisconnectModalOpen}
        selectedConnection={selectedConnection}
        isPending={disconnectMutation.isPending}
        onClose={() => setIsDisconnectModalOpen(false)}
        onConfirmDisconnect={handleDisconnect}
      />
    </div>
  );
};
