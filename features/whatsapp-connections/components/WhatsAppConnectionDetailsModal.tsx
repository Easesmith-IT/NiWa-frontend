import React from "react";
import { Settings, X, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { WhatsAppConnectionRecord } from "../../../lib/api/types";

export interface WhatsAppConnectionDetailsModalProps {
  isOpen: boolean;
  selectedConnection: WhatsAppConnectionRecord | null;
  onClose: () => void;
  onOpenDisconnectModal: () => void;
  formatDate: (dateStr?: string | null) => string;
}

export const WhatsAppConnectionDetailsModal: React.FC<WhatsAppConnectionDetailsModalProps> = ({
  isOpen,
  selectedConnection,
  onClose,
  onOpenDisconnectModal,
  formatDate,
}) => {
  if (!isOpen || !selectedConnection) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" />
              Connection Overview
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Overview Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overview</h4>
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
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Technical Information</h4>
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
          <Button variant="destructive" size="sm" onClick={onOpenDisconnectModal} className="text-xs gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />
            Disconnect Account
          </Button>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
