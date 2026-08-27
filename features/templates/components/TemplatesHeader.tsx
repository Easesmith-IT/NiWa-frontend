import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "../../../components/ui/button";

export interface TemplatesHeaderProps {
  isSyncing: boolean;
  onSync: () => void;
}

export const TemplatesHeader: React.FC<TemplatesHeaderProps> = ({
  isSyncing,
  onSync,
}) => {
  return (
    <div className="flex flex-col gap-3.5 rounded-lg border border-[#E4E4E7] bg-white p-4 shadow-subtle md:flex-row md:items-center md:justify-between dark:border-[#292C2F] dark:bg-[#121416]">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          WhatsApp Template Studio
        </h1>
        <p className="text-xs text-muted-foreground">
          Meta-approved message templates, schemas, and live message preview canvas.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          disabled={isSyncing}
          onClick={onSync}
          size="sm"
          type="button"
          variant="primary"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync From Meta"}
        </Button>
      </div>
    </div>
  );
};
