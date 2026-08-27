import React from "react";
import { AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import type { WhatsAppConnectionRecord } from "../../../lib/api/types";

export interface WhatsAppDisconnectModalProps {
  isOpen: boolean;
  selectedConnection: WhatsAppConnectionRecord | null;
  isPending: boolean;
  onClose: () => void;
  onConfirmDisconnect: (id: string) => void;
}

export const WhatsAppDisconnectModal: React.FC<WhatsAppDisconnectModalProps> = ({
  isOpen,
  selectedConnection,
  isPending,
  onClose,
  onConfirmDisconnect,
}) => {
  if (!isOpen || !selectedConnection) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Disconnect WhatsApp Connection?
          </h3>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Disconnecting will pause messaging and automated workflows for this WhatsApp Business number. Historical
          conversations, messages, templates, and analytics will remain preserved in NiWa.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onConfirmDisconnect(selectedConnection.id)}
            disabled={isPending}
            className="text-xs gap-1.5"
          >
            {isPending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Confirm Disconnect
          </Button>
        </div>
      </Card>
    </div>
  );
};
