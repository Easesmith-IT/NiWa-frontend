"use client";

import Link from "next/link";
import { useState } from "react";
import { Bot, PlayCircle, PauseCircle, Archive, Plus, Workflow } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  useAutomationLifecycleV1Mutation,
  useAutomationTestV1Mutation,
  useAutomationsV1Query,
  useCreateAutomationV1Mutation,
  type AutomationConditionRecordV1,
  type AutomationStepRecordV1,
} from "../../../features/automations";

const newCondition = (): AutomationConditionRecordV1 => ({
  operator: "contains",
  source: "trigger.previewText",
  value: "",
});

const newStep = (): AutomationStepRecordV1 => ({
  config: { body: "" },
  type: "send_message",
});

export default function AutomationsPage() {
  const [statusFilter, setStatusFilter] = useState<"active" | "all" | "archived" | "paused">("all");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState<"incoming_message" | "manual">("incoming_message");
  const [messageTypeFilter, setMessageTypeFilter] = useState("");
  const [conditions, setConditions] = useState<AutomationConditionRecordV1[]>([newCondition()]);
  const [steps, setSteps] = useState<AutomationStepRecordV1[]>([newStep()]);
  const [testContactId, setTestContactId] = useState("");

  const automationsQuery = useAutomationsV1Query(statusFilter === "all" ? undefined : { status: statusFilter });
  const createAutomationMutation = useCreateAutomationV1Mutation();
  const lifecycleMutation = useAutomationLifecycleV1Mutation();
  const testAutomationMutation = useAutomationTestV1Mutation();

  const automations = automationsQuery.data?.data ?? [];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#292C2F] dark:bg-[#121416]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Automation Engine
            </h1>
            <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
              Build operator automations that react to inbound WhatsApp messages, condition rules, wait steps, and audit execution trails.
            </p>
          </div>
          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3.5 dark:border-[#292C2F] dark:bg-[#17191B]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Run Telemetry</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Monitor active runs, wait queues, and step execution logs.
            </p>
            <Link
              className="mt-2.5 inline-flex h-8 items-center justify-center rounded-md border border-[#E4E4E7] bg-white px-3 text-xs font-medium text-foreground shadow-subtle transition-colors hover:bg-[#F4F4F5] dark:border-[#292C2F] dark:bg-[#121416] dark:hover:bg-[#1C1F21]"
              href="/automations/runs"
            >
              Open Runs Log
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[430px_minmax(0,1fr)]">
        <Card className="space-y-3.5 p-4">
          <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2.5 dark:border-[#202326]">
            <Workflow className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
            <h2 className="text-sm font-semibold text-foreground">Create Automation</h2>
          </div>
          <Input placeholder="Automation name" value={name} onChange={(event) => setName(event.target.value)} />
          <Textarea
            className="min-h-20 text-xs"
            placeholder="Describe what this automation does..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <div className="grid gap-2 md:grid-cols-2">
            <select
              className="h-8.5 rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#17191B]"
              value={triggerType}
              onChange={(event) => setTriggerType(event.target.value as "incoming_message" | "manual")}
            >
              <option value="incoming_message">Incoming message</option>
              <option value="manual">Manual</option>
            </select>
            <Input
              placeholder="Message type filter (optional)"
              value={messageTypeFilter}
              onChange={(event) => setMessageTypeFilter(event.target.value)}
            />
          </div>

          <div className="space-y-2.5 rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#292C2F] dark:bg-[#17191B]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-foreground">Conditions</p>
              <Button
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => setConditions((current) => [...current, newCondition()])}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Rule
              </Button>
            </div>
            {conditions.map((condition, index) => (
              <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_110px_minmax(0,1fr)]" key={index}>
                <Input
                  className="bg-white dark:bg-[#121416]"
                  placeholder="Source path"
                  value={condition.source}
                  onChange={(event) =>
                    setConditions((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, source: event.target.value } : item,
                      ),
                    )
                  }
                />
                <select
                  className="h-8.5 rounded-md border border-[#D4D4D8] bg-white px-2 text-xs text-foreground outline-none dark:border-[#303438] dark:bg-[#121416]"
                  value={condition.operator}
                  onChange={(event) =>
                    setConditions((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              operator: event.target.value as AutomationConditionRecordV1["operator"],
                            }
                          : item,
                      ),
                    )
                  }
                >
                  <option value="contains">contains</option>
                  <option value="equals">equals</option>
                  <option value="not_equals">not equals</option>
                  <option value="exists">exists</option>
                </select>
                <Input
                  className="bg-white dark:bg-[#121416]"
                  placeholder="Match value"
                  value={condition.value ?? ""}
                  onChange={(event) =>
                    setConditions((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, value: event.target.value } : item,
                      ),
                    )
                  }
                />
              </div>
            ))}
          </div>

          <div className="space-y-2.5 rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#292C2F] dark:bg-[#17191B]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-foreground">Steps</p>
              <Button
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => setSteps((current) => [...current, newStep()])}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Step
              </Button>
            </div>
            {steps.map((step, index) => (
              <div className="space-y-2 rounded-md border border-[#E4E4E7] bg-white p-2.5 dark:border-[#292C2F] dark:bg-[#121416]" key={index}>
                <select
                  className="h-8.5 w-full rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none dark:border-[#303438] dark:bg-[#17191B]"
                  value={step.type}
                  onChange={(event) =>
                    setSteps((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              type: event.target.value as AutomationStepRecordV1["type"],
                              config:
                                event.target.value === "send_message"
                                  ? { body: "" }
                                  : event.target.value === "create_task"
                                    ? { title: "", priority: "medium", dueInMinutes: 60 }
                                    : event.target.value === "create_note"
                                      ? { content: "", pinned: false }
                                      : { delayMinutes: 5 },
                            }
                          : item,
                      ),
                    )
                  }
                >
                  <option value="send_message">Send message</option>
                  <option value="create_task">Create task</option>
                  <option value="create_note">Create note</option>
                  <option value="wait">Wait</option>
                </select>

                {step.type === "send_message" ? (
                  <Textarea
                    className="min-h-16 text-xs"
                    placeholder="Message body, supports {{contact.displayName}} and {{trigger.previewText}}"
                    value={String(step.config.body ?? "")}
                    onChange={(event) =>
                      setSteps((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, config: { body: event.target.value } } : item,
                        ),
                      )
                    }
                  />
                ) : null}

                {step.type === "create_task" ? (
                  <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_100px_100px]">
                    <Input
                      className="bg-white dark:bg-[#17191B]"
                      placeholder="Task title"
                      value={String(step.config.title ?? "")}
                      onChange={(event) =>
                        setSteps((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, config: { ...item.config, title: event.target.value } }
                              : item,
                          ),
                        )
                      }
                    />
                    <Input
                      className="bg-white dark:bg-[#17191B]"
                      placeholder="Due in min"
                      type="number"
                      value={String(step.config.dueInMinutes ?? 60)}
                      onChange={(event) =>
                        setSteps((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  config: {
                                    ...item.config,
                                    dueInMinutes: Number(event.target.value || 0),
                                  },
                                }
                              : item,
                          ),
                        )
                      }
                    />
                    <select
                      className="h-8.5 rounded-md border border-[#D4D4D8] bg-white px-2 text-xs text-foreground outline-none dark:border-[#303438] dark:bg-[#17191B]"
                      value={String(step.config.priority ?? "medium")}
                      onChange={(event) =>
                        setSteps((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, config: { ...item.config, priority: event.target.value } }
                              : item,
                          ),
                        )
                      }
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                ) : null}

                {step.type === "create_note" ? (
                  <div className="space-y-2">
                    <Textarea
                      className="min-h-16 text-xs"
                      placeholder="Internal note body"
                      value={String(step.config.content ?? "")}
                      onChange={(event) =>
                        setSteps((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, config: { ...item.config, content: event.target.value } }
                              : item,
                          ),
                        )
                      }
                    />
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={Boolean(step.config.pinned)}
                        onChange={(event) =>
                          setSteps((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, config: { ...item.config, pinned: event.target.checked } }
                                : item,
                            ),
                          )
                        }
                      />
                      Pin note
                    </label>
                  </div>
                ) : null}

                {step.type === "wait" ? (
                  <Input
                    className="bg-white dark:bg-[#17191B]"
                    placeholder="Delay in minutes"
                    type="number"
                    value={String(step.config.delayMinutes ?? 5)}
                    onChange={(event) =>
                      setSteps((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                config: { delayMinutes: Number(event.target.value || 0) },
                              }
                            : item,
                        ),
                      )
                    }
                  />
                ) : null}
              </div>
            ))}
          </div>

          <Button
            className="w-full font-medium"
            disabled={!name.trim() || steps.length === 0 || createAutomationMutation.isPending}
            onClick={() =>
              createAutomationMutation.mutate(
                {
                  conditions: conditions
                    .filter((item) => item.source.trim())
                    .map((item) => ({
                      ...item,
                      value: item.value ?? undefined,
                    })),
                  description: description.trim() || undefined,
                  name: name.trim(),
                  steps: steps,
                  trigger: {
                    config:
                      triggerType === "incoming_message" && messageTypeFilter.trim()
                        ? { messageTypes: [messageTypeFilter.trim()] }
                        : {},
                    type: triggerType,
                  },
                },
                {
                  onSuccess: () => {
                    setName("");
                    setDescription("");
                    setTriggerType("incoming_message");
                    setMessageTypeFilter("");
                    setConditions([newCondition()]);
                    setSteps([newStep()]);
                  },
                },
              )
            }
            type="button"
            variant="primary"
          >
            {createAutomationMutation.isPending ? "Saving..." : "Create Automation"}
          </Button>
        </Card>

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
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-2.5 md:grid-cols-[minmax(0,1fr)_200px]">
            <Input
              placeholder="Test run contact ID"
              value={testContactId}
              onChange={(event) => setTestContactId(event.target.value)}
            />
            <p className="text-[11px] text-muted-foreground self-center">
              Enter contact ID to trigger manual execution.
            </p>
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
                        onClick={() =>
                          lifecycleMutation.mutate({ action: "activate", automationId: automation._id })
                        }
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
                        onClick={() =>
                          lifecycleMutation.mutate({ action: "pause", automationId: automation._id })
                        }
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
                        onClick={() =>
                          lifecycleMutation.mutate({ action: "archive", automationId: automation._id })
                        }
                      >
                        <Archive className="h-3.5 w-3.5" />
                        Archive
                      </Button>
                    ) : null}
                    <Button
                      disabled={!testContactId.trim() || testAutomationMutation.isPending}
                      size="sm"
                      type="button"
                      variant="primary"
                      onClick={() =>
                        testAutomationMutation.mutate({
                          automationId: automation._id,
                          payload: {
                            contactId: testContactId.trim(),
                          },
                        })
                      }
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
      </section>
    </div>
  );
}

