import React, { useState } from "react";
import { DollarSign, Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { PanelSection } from "./PanelSection";
import { useDealsQuery } from "../../deals/deal.queries";
import { isDealOverdue, isDealStalled } from "../../deals/deal.utils";
import type { DealRecord } from "../../deals/deal.types";
import { DealFormModal } from "../../deals/components/DealFormModal";

export interface ContactDealsSectionProps {
  personId?: string | null;
  companyId?: string | null;
  contactDisplayName?: string;
}

export function ContactDealsSection({
  personId,
  companyId,
  contactDisplayName,
}: ContactDealsSectionProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: deals = [], isLoading } = useDealsQuery();

  // Filter deals related to this contact's personId or companyId
  const relatedDeals = deals.filter((d: DealRecord) => {
    if (personId && (d.primaryPersonId === personId || d.participants?.some((p) => p.personId === personId))) {
      return true;
    }
    if (companyId && d.companyId === companyId) {
      return true;
    }
    return false;
  });

  return (
    <PanelSection title="Deals">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground font-medium">
            {relatedDeals.length} active deal{relatedDeals.length === 1 ? "" : "s"}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-6 px-1.5 text-xs text-primary hover:text-primary/80"
          >
            <Plus className="h-3 w-3 mr-1" /> New Deal
          </Button>
        </div>

        {isLoading ? (
          <p className="text-xs text-muted-foreground italic">Loading deals...</p>
        ) : relatedDeals.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No deals linked</p>
        ) : (
          <div className="space-y-1.5">
            {relatedDeals.map((deal) => {
              const overdue = isDealOverdue(deal);
              const stalled = isDealStalled(deal);

              return (
                <div
                  key={deal._id}
                  className="rounded-md border border-border bg-card p-2 text-xs space-y-1"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-foreground truncate max-w-[170px]">
                      {deal.title}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                        deal.status === "WON"
                          ? "bg-green-100 text-green-700"
                          : deal.status === "LOST"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {deal.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-medium text-blue-600 flex items-center">
                      <DollarSign className="h-3 w-3 mr-0.5" />
                      {deal.value ? deal.value.toLocaleString() : "0"} {deal.currency || "USD"}
                    </span>
                    <div className="flex items-center space-x-1">
                      {overdue && (
                        <span className="text-[9px] bg-red-100 text-red-700 px-1 rounded font-bold">
                          Overdue
                        </span>
                      )}
                      {stalled && (
                        <span className="text-[9px] bg-amber-100 text-amber-700 px-1 rounded font-bold">
                          Stalled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isCreateModalOpen && (
          <DealFormModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />
        )}
      </div>
    </PanelSection>
  );
}
