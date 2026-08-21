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
  Trash2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { MetaEmbeddedSignup } from "../../components/whatsapp/MetaEmbeddedSignup";
import { useWhatsAppSettingsState } from "./hooks/useWhatsAppSettingsState";

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
      {isDetailOpen && selectedConnection && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end transition-opacity">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-600" />
                  Connection Overview
                </h3>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Overview Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Overview
                </h4>
                <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Business Name</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedConnection.displayName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">WhatsApp Phone</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedConnection.displayPhoneNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Verified Display Name</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedConnection.verifiedName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Connection Status</span>
                    <span className="font-semibold text-emerald-600 capitalize">{selectedConnection.connectionStatus}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Connected Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(selectedConnection.connectedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Technical Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Technical Information
                </h4>
                <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-950 p-4 rounded-xl font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">WABA ID</span>
                    <span className="text-slate-800 dark:text-slate-200">{selectedConnection.wabaId || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Phone Number ID</span>
                    <span className="text-slate-800 dark:text-slate-200">{selectedConnection.phoneNumberId}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Meta Business ID</span>
                    <span className="text-slate-800 dark:text-slate-200">{selectedConnection.metaBusinessId || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDisconnectModalOpen(true)}
                className="text-xs gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Disconnect Account
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect Confirmation Modal */}
      {isDisconnectModalOpen && selectedConnection && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Disconnect WhatsApp Connection?
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Disconnecting will pause messaging and automated workflows for this WhatsApp Business number. Historical conversations, messages, templates, and analytics will remain preserved in NiWa.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDisconnectModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDisconnect(selectedConnection.id)}
                disabled={disconnectMutation.isPending}
                className="text-xs gap-1.5"
              >
                {disconnectMutation.isPending ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Confirm Disconnect
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
