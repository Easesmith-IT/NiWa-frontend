import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Archive, Bot, PauseCircle, PlayCircle, User } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { listContacts } from "../../contacts/contact.api";
import type { AutomationRecord } from "../automation.types";

export interface AutomationRegistryCardProps {
  statusFilter: "active" | "all" | "archived" | "paused";
  onStatusFilterChange: (status: "active" | "all" | "archived" | "paused") => void;
  testContactId: string;
  onTestContactIdChange: (value: string) => void;
  automations: AutomationRecord[];
  isTesting: boolean;
  onActivateAutomation: (automationId: string) => void;
  onPauseAutomation: (automationId: string) => void;
  onArchiveAutomation: (automationId: string) => void;
  onRunTest: (automationId: string) => void;
}

export const AutomationRegistryCard: React.FC<AutomationRegistryCardProps> = ({
  statusFilter,
  onStatusFilterChange,
  testContactId,
  onTestContactIdChange,
  automations,
  isTesting,
  onActivateAutomation,
  onPauseAutomation,
  onArchiveAutomation,
  onRunTest,
}) => {
  const { data: contactsResponse } = useQuery({
    queryKey: ["contacts", "automation-test-picker"],
    queryFn: () => listContacts({ limit: 100 }),
  });
  const contacts = contactsResponse?.data ?? [];

  return (
    <Card className="space-y-3.5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0F0F2] pb-2.5 dark:border-[#202326]">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Automation Registry</h2>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", "active", "paused", "archived"] as const).map((status) => (
            <Button
              key={status}
              size="sm"
              type="button"
              variant={statusFilter === status ? "primary" : "secondary"}
              onClick={() => onStatusFilterChange(status)}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#292C2F] dark:bg-[#17191B]">
        <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <User className="h-3.5 w-3.5 text-[#176B4D] dark:text-[#63B592]" />
          Test Contact for Manual Execution
        </label>
        <div className="grid gap-2 md:grid-cols-2">
          <select
            value={contacts.some((c) => c._id === testContactId) ? testContactId : ""}
            onChange={(event) => onTestContactIdChange(event.target.value)}
            className="h-8.5 rounded-md border border-[#D4D4D8] bg-white px-2.5 text-xs text-foreground focus:border-[#176B4D] focus:outline-none dark:border-[#303438] dark:bg-[#121416]"
          >
            <option value="">Select a contact by name or phone...</option>
            {contacts.map((c) => (
              <option key={c._id} value={c._id}>
                {c.displayName} ({c.phoneNumber})
              </option>
            ))}
          </select>
          <Input
            placeholder="Or enter contact ID directly"
            value={testContactId}
            onChange={(event) => onTestContactIdChange(event.target.value)}
            className="h-8.5 bg-white text-xs dark:bg-[#121416]"
          />
        </div>
      </div>

      <div className="space-y-3">
        {automations.map((automation) => (
          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3.5 dark:border-[#292C2F] dark:bg-[#17191B]" key={automation._id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{automation.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {automation.description || "No description provided."}
                </p>
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {automation.trigger.type} • {automation.status} • {automation.steps.length} step(s)
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {automation.status !== "active" ? (
                  <Button
                    size="sm"
                    type="button"
                    variant="secondary"
                    onClick={() => onActivateAutomation(automation._id)}
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    Activate
                  </Button>
                ) : null}
                {automation.status === "active" ? (
                  <Button
                    size="sm"
                    type="button"
                    variant="secondary"
                    onClick={() => onPauseAutomation(automation._id)}
                  >
                    <PauseCircle className="h-3.5 w-3.5" />
                    Pause
                  </Button>
                ) : null}
                {automation.status !== "archived" ? (
                  <Button
                    size="sm"
                    type="button"
                    variant="secondary"
                    onClick={() => onArchiveAutomation(automation._id)}
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Archive
                  </Button>
                ) : null}
                <Button
                  disabled={!testContactId.trim() || isTesting}
                  size="sm"
                  type="button"
                  variant="primary"
                  onClick={() => onRunTest(automation._id)}
                >
                  Run Test
                </Button>
              </div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Conditions
                </p>
                <div className="mt-1.5 space-y-1.5">
                  {automation.conditions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No conditions. Direct trigger.</p>
                  ) : (
                    automation.conditions.map((condition, index) => (
                      <div className="rounded-md border border-[#E4E4E7] bg-white px-2.5 py-1.5 text-xs text-foreground font-mono dark:border-[#292C2F] dark:bg-[#121416]" key={index}>
                        {condition.source} {condition.operator}
                        {condition.value ? ` "${condition.value}"` : ""}
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Steps
                </p>
                <div className="mt-1.5 space-y-1.5">
                  {automation.steps.map((step, index) => (
                    <div className="rounded-md border border-[#E4E4E7] bg-white px-2.5 py-1.5 text-xs text-foreground dark:border-[#292C2F] dark:bg-[#121416]" key={index}>
                      {index + 1}. {step.type}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {automations.length === 0 ? (
        <p className="text-xs text-muted-foreground">No automations match this filter.</p>
      ) : null}
    </Card>
  );
};
