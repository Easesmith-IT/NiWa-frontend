"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  DollarSign,
  Edit2,
  ExternalLink,
  MoveRight,
  TrendingUp,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../../../components/ui/drawer";
import { Button } from "../../../components/ui/button";
import type { DealRecord } from "../deal.types";
import { useUpdateDealMutation } from "../deal.queries";

export interface DealDetailDrawerProps {
  deal: DealRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (deal: DealRecord) => void;
  onMove: (deal: DealRecord) => void;
  stages?: Array<{ _id: string; name: string }>;
  pipelineName?: string;
}

export const DealDetailDrawer: React.FC<DealDetailDrawerProps> = ({
  deal,
  isOpen,
  onClose,
  onEdit,
  onMove,
  stages = [],
  pipelineName,
}) => {
  const router = useRouter();
  const updateMutation = useUpdateDealMutation();

  if (!deal) return null;

  const currentStage = stages.find((s) => String(s._id) === String(deal.stageId));

  const handleStatusChange = async (newStatus: "WON" | "LOST" | "OPEN") => {
    try {
      await updateMutation.mutateAsync({
        id: deal._id,
        payload: { status: newStatus },
      });
    } catch (err) {
      console.error("Failed to update deal status", err);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        hideClose
        side="right"
        className="w-full max-w-lg p-0 flex flex-col h-full bg-white dark:bg-[#17191B] border-l border-[#E4E4E7] dark:border-[#282B2E]"
      >
        <DrawerHeader className="border-b border-[#E4E4E7] p-5 dark:border-[#282B2E]">
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                deal.status === "WON"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : deal.status === "LOST"
                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
              }`}
            >
              {deal.status}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(deal);
                }}
                className="h-7 text-xs"
              >
                <Edit2 className="mr-1 h-3 w-3" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onMove(deal);
                }}
                className="h-7 text-xs"
              >
                <MoveRight className="mr-1 h-3 w-3" /> Move
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                aria-label="Close deal details"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DrawerTitle className="mt-3 text-lg font-bold text-foreground">
            {deal.title}
          </DrawerTitle>
          <div className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-[#176B4D] dark:text-[#63B592]">
            {deal.currency || "$"} {deal.value ? deal.value.toLocaleString() : "0"}
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 niwa-scrollbar">
          {/* Stage & Pipeline */}
          <div className="rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] p-4 dark:border-[#282B2E] dark:bg-[#1C1F22]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Pipeline Stage
            </span>
            <div className="mt-1 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {currentStage?.name || "Current Stage"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {pipelineName || "Sales Pipeline"}
                </p>
              </div>
              {deal.probability !== undefined && deal.probability !== null && (
                <div className="text-right">
                  <span className="text-xs font-bold text-foreground">
                    {deal.probability}%
                  </span>
                  <p className="text-[10px] text-muted-foreground">Win Likelihood</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Win/Loss Actions */}
          {deal.status === "OPEN" && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleStatusChange("WON")}
                className="bg-emerald-600 text-xs text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                size="sm"
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Mark Won
              </Button>
              <Button
                onClick={() => handleStatusChange("LOST")}
                variant="outline"
                className="text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                size="sm"
              >
                <XCircle className="mr-1.5 h-3.5 w-3.5" /> Mark Lost
              </Button>
            </div>
          )}

          {/* Key Deal Details */}
          <div className="rounded-xl border border-[#E4E4E7] p-4 space-y-3 dark:border-[#282B2E]">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Deal Information
            </h4>

            {deal.expectedCloseDate && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" /> Expected Close
                </span>
                <span className="font-medium text-foreground">
                  {new Date(deal.expectedCloseDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {deal.description && (
              <div className="pt-2 text-xs">
                <span className="text-muted-foreground block mb-1">Description:</span>
                <p className="rounded-lg bg-[#F4F4F5] p-2.5 text-foreground leading-relaxed dark:bg-[#202326]">
                  {deal.description}
                </p>
              </div>
            )}
          </div>

          {/* Linked Customer Overview */}
          {(deal.primaryPersonId || deal.companyId) && (
            <div className="rounded-xl border border-[#E4E4E7] p-4 space-y-3 dark:border-[#282B2E]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Linked Customer
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClose();
                    router.push(
                      `/crm/customer-360?recordType=${deal.primaryPersonId ? "Person" : "Company"}&recordId=${deal.primaryPersonId || deal.companyId}`
                    );
                  }}
                  className="h-6 px-1.5 text-[11px] text-[#176B4D] hover:bg-[#EDF8F3] dark:text-[#63B592] dark:hover:bg-[#15271F]"
                >
                  Customer 360 <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-[#FAFAFA] p-2.5 dark:bg-[#1C1F22]">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDF8F3] text-[#176B4D] dark:bg-[#15271F] dark:text-[#63B592]">
                  {deal.primaryPersonId ? <User className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-semibold text-foreground truncate">
                    {deal.primaryPersonId ? "Customer Person" : "Company Account"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    ID: {deal.primaryPersonId || deal.companyId}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sales Conversion Bridge */}
          <div className="rounded-xl border border-[#E4E4E7] p-4 space-y-2 dark:border-[#282B2E]">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sales Actions
            </h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  router.push(`/sales/quotes?dealId=${deal._id}`);
                }}
                className="flex-1 text-xs"
              >
                Create Quotation
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  router.push(`/sales/orders?dealId=${deal._id}`);
                }}
                className="flex-1 text-xs"
              >
                Create Sales Order
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
