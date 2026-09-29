import React, { useEffect, useState } from "react";
import { DollarSign, Plus, UserCheck, Edit2, Move, Calendar, User, ArrowRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { PanelSection } from "./PanelSection";
import { useDealsQuery } from "../../deals/deal.queries";
import { isDealOverdue, isDealStalled } from "../../deals/deal.utils";
import type { DealRecord } from "../../deals/deal.types";
import { DealFormModal } from "../../deals/components/DealFormModal";
import { DealMoveModal } from "../../deals/components/DealMoveModal";
import { useLeadsQuery, useConvertLeadMutation } from "../../leads/lead.queries";
import type { LeadRecord } from "../../leads/lead.types";
import { LeadFormModal } from "../../leads/components/LeadFormModal";
import { usePipelinesQuery, useStagesQuery } from "../../pipelines/pipeline.queries";

export interface ContactDealsSectionProps {
  personId?: string | null;
  companyId?: string | null;
  contactDisplayName?: string;
}

function ConvertLeadModal({
  lead,
  isOpen,
  onClose,
}: {
  lead: LeadRecord | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: pipelines = [] } = usePipelinesQuery({ isActive: true });
  const [pipelineId, setPipelineId] = useState("");
  const [stageId, setStageId] = useState("");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: stages = [] } = useStagesQuery(
    pipelineId ? { pipelineId, isActive: true } : undefined
  );

  const convertMutation = useConvertLeadMutation();

  useEffect(() => {
    if (lead) {
      setTitle(lead.title ? `Deal - ${lead.title}` : "Converted Deal");
      setValue(lead.value !== undefined && lead.value !== null ? String(lead.value) : "");
      if (pipelines.length > 0 && !pipelineId) {
        const defaultPipe = pipelines.find((p) => p.isDefault) || pipelines[0];
        setPipelineId(defaultPipe._id);
      }
    }
  }, [lead, pipelines]);

  useEffect(() => {
    if (stages.length > 0 && !stageId) {
      setStageId(stages[0]._id);
    }
  }, [stages]);

  const handleConvert = async () => {
    if (!lead) return;
    if (!pipelineId || !stageId) {
      setErrorMsg("Please select a pipeline and stage");
      return;
    }

    try {
      await convertMutation.mutateAsync({
        id: lead._id,
        payload: {
          pipelineId,
          stageId,
          title: title.trim() || undefined,
          value: value ? Number(value) : undefined,
          currency: lead.currency || "USD",
        },
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Conversion failed");
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">
            Convert Lead to Deal
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2 text-xs">
          {errorMsg && (
            <div className="rounded bg-destructive/10 p-2 text-destructive">{errorMsg}</div>
          )}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Deal Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Pipeline</label>
            <select
              value={pipelineId}
              onChange={(e) => {
                setPipelineId(e.target.value);
                setStageId("");
              }}
              className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select Pipeline...</option>
              {pipelines.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Stage</label>
            <select
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select Stage...</option>
              {stages.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              Value ({lead.currency || "USD"})
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button size="sm" variant="ghost" onClick={onClose} disabled={convertMutation.isPending}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConvert}
              disabled={convertMutation.isPending || !pipelineId || !stageId}
            >
              {convertMutation.isPending ? "Converting..." : "Convert Lead"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ContactDealsSection({
  personId,
  companyId,
  contactDisplayName,
}: ContactDealsSectionProps) {
  const [isCreateDealModalOpen, setIsCreateDealModalOpen] = useState(false);
  const [isCreateLeadModalOpen, setIsCreateLeadModalOpen] = useState(false);
  const [selectedDealForEdit, setSelectedDealForEdit] = useState<DealRecord | null>(null);
  const [selectedDealForMove, setSelectedDealForMove] = useState<DealRecord | null>(null);
  const [leadToConvert, setLeadToConvert] = useState<LeadRecord | null>(null);

  // Scoped query passing personId and companyId
  const { data: deals = [], isLoading: isLoadingDeals } = useDealsQuery(
    personId || companyId
      ? { personId: personId || undefined, companyId: companyId || undefined }
      : undefined
  );

  const { data: leads = [], isLoading: isLoadingLeads } = useLeadsQuery(
    personId || companyId
      ? { personId: personId || undefined, companyId: companyId || undefined }
      : undefined,
    { enabled: Boolean(personId || companyId) }
  );

  // Filter deals related to this contact's personId or companyId as client fallback
  const relatedDeals = deals.filter((d: DealRecord) => {
    if (personId && (d.primaryPersonId === personId || d.participants?.some((p) => p.personId === personId))) {
      return true;
    }
    if (companyId && d.companyId === companyId) {
      return true;
    }
    return !personId && !companyId;
  });

  const activeLeads = leads.filter((l: LeadRecord) => l.status !== "CONVERTED" && l.status !== "LOST");

  return (
    <PanelSection title="Deals & Leads">
      <div className="space-y-3">
        {/* Deals Subsection Header */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground font-medium">
            {relatedDeals.length} deal{relatedDeals.length === 1 ? "" : "s"}
          </span>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsCreateLeadModalOpen(true)}
              className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3 w-3 mr-0.5" /> Lead
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsCreateDealModalOpen(true)}
              className="h-6 px-1.5 text-[11px] text-primary hover:text-primary/80"
            >
              <Plus className="h-3 w-3 mr-0.5" /> Deal
            </Button>
          </div>
        </div>

        {/* Deals Listing */}
        {isLoadingDeals ? (
          <p className="text-xs text-muted-foreground italic">Loading deals...</p>
        ) : relatedDeals.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No deals linked</p>
        ) : (
          <div className="space-y-2">
            {relatedDeals.map((deal) => {
              const overdue = isDealOverdue(deal);
              const stalled = isDealStalled(deal);

              return (
                <div
                  key={deal._id}
                  onClick={() => setSelectedDealForEdit(deal)}
                  className="rounded-md border border-border bg-card p-2.5 text-xs space-y-1.5 hover:border-primary/50 hover:shadow-sm cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-semibold text-foreground truncate max-w-[160px]">
                      {deal.title}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                        deal.status === "WON"
                          ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                          : deal.status === "LOST"
                          ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                      }`}
                    >
                      {deal.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-medium text-blue-600 dark:text-blue-400 flex items-center">
                      <DollarSign className="h-3 w-3 mr-0.5" />
                      {deal.value ? deal.value.toLocaleString() : "0"} {deal.currency || "USD"}
                    </span>
                    <div className="flex items-center space-x-1">
                      {overdue && (
                        <span className="text-[9px] bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 px-1 rounded font-bold">
                          Overdue
                        </span>
                      )}
                      {stalled && (
                        <span className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 px-1 rounded font-bold">
                          Stalled
                        </span>
                      )}
                    </div>
                  </div>

                  {deal.expectedCloseDate && (
                    <div className="text-[10px] text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-slate-400" />
                      Target: {deal.expectedCloseDate}
                    </div>
                  )}

                  {deal.ownerUserId && (
                    <div className="text-[10px] text-muted-foreground flex items-center">
                      <User className="h-3 w-3 mr-1 text-slate-400" />
                      Owner: {deal.ownerUserId.slice(-6)}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1 pt-1 border-t border-border/40">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDealForMove(deal);
                      }}
                      className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      <Move className="h-2.5 w-2.5 mr-0.5" /> Move
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDealForEdit(deal);
                      }}
                      className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-2.5 w-2.5 mr-0.5" /> Edit
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Leads Subsection (if leads exist or loading) */}
        {(isLoadingLeads || activeLeads.length > 0) && (
          <div className="pt-2 border-t border-border/50 space-y-2">
            <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              <UserCheck className="h-3 w-3" />
              {activeLeads.length} active lead{activeLeads.length === 1 ? "" : "s"}
            </span>
            {activeLeads.map((lead) => (
              <div
                key={lead._id}
                className="rounded-md border border-border/80 bg-card/60 p-2 text-xs space-y-1.5"
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="font-medium text-foreground truncate max-w-[150px]">
                    {lead.title}
                  </span>
                  <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {lead.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  {lead.value ? (
                    <span className="text-muted-foreground">
                      {lead.value.toLocaleString()} {lead.currency || "USD"}
                    </span>
                  ) : <span />}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLeadToConvert(lead)}
                    className="h-5 px-1.5 text-[10px] text-primary hover:text-primary/80"
                  >
                    <ArrowRight className="h-2.5 w-2.5 mr-0.5" /> Convert
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        {isCreateDealModalOpen && (
          <DealFormModal
            isOpen={isCreateDealModalOpen}
            onClose={() => setIsCreateDealModalOpen(false)}
            defaultPrimaryPersonId={personId}
            defaultCompanyId={companyId}
            defaultTitle={contactDisplayName ? `Deal - ${contactDisplayName}` : ""}
          />
        )}

        {selectedDealForEdit && (
          <DealFormModal
            isOpen={Boolean(selectedDealForEdit)}
            onClose={() => setSelectedDealForEdit(null)}
            deal={selectedDealForEdit}
          />
        )}

        {selectedDealForMove && (
          <DealMoveModal
            isOpen={Boolean(selectedDealForMove)}
            onClose={() => setSelectedDealForMove(null)}
            deal={selectedDealForMove}
          />
        )}

        {isCreateLeadModalOpen && (
          <LeadFormModal
            isOpen={isCreateLeadModalOpen}
            onClose={() => setIsCreateLeadModalOpen(false)}
            defaultPrimaryPersonId={personId}
            defaultCompanyId={companyId}
            defaultTitle={contactDisplayName ? `Lead - ${contactDisplayName}` : ""}
          />
        )}

        {leadToConvert && (
          <ConvertLeadModal
            lead={leadToConvert}
            isOpen={Boolean(leadToConvert)}
            onClose={() => setLeadToConvert(null)}
          />
        )}
      </div>
    </PanelSection>
  );
}

