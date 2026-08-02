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
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,rgba(22,42,47,0.96),rgba(48,77,74,0.88))] p-6 text-[#f6f0de] shadow-[0_20px_60px_rgba(13,29,24,0.28)]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c29b]">
              Stage 6
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Automation engine</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#d9e6dd]">
              Build inspectable operator automations that react to inbound threads, queue wait
              steps, and leave a readable execution trail.
            </p>
          </div>
          <div className="rounded-[1.6rem] bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-[#d4c29b]">Run inspection</p>
            <p className="mt-2 text-sm text-[#eef6ef]">
              New runs appear in the dedicated queue surface with step logs and final status.
            </p>
            <Link
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-card px-4 text-sm font-medium text-foreground ring-1 ring-border transition hover:bg-accent hover:text-accent-foreground"
              href="/automations/runs"
            >
              Open runs list
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[430px_minmax(0,1fr)]">
        <Card className="space-y-4 border-white/60 bg-white/78 p-5 backdrop-blur">
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Create automation</h2>
          </div>
          <Input placeholder="Automation name" value={name} onChange={(event) => setName(event.target.value)} />
          <Textarea
            className="min-h-24 rounded-[1.4rem] bg-[#faf7ef]"
            placeholder="Describe what this automation does"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <div className="grid gap-2 md:grid-cols-2">
            <select
              className="h-11 rounded-2xl border border-input bg-[#faf7ef] px-3 text-sm outline-none"
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

          <div className="space-y-3 rounded-[1.4rem] bg-[#faf7ef] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Conditions</p>
              <Button
                className="rounded-full"
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => setConditions((current) => [...current, newCondition()])}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
            {conditions.map((condition, index) => (
              <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_140px_minmax(0,1fr)]" key={index}>
                <Input
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
                  className="h-11 rounded-2xl border border-input bg-white px-3 text-sm outline-none"
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

          <div className="space-y-3 rounded-[1.4rem] bg-[#faf7ef] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Steps</p>
              <Button
                className="rounded-full"
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => setSteps((current) => [...current, newStep()])}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
            {steps.map((step, index) => (
              <div className="space-y-2 rounded-[1.2rem] bg-white/80 p-3" key={index}>
                <select
                  className="h-11 w-full rounded-2xl border border-input bg-white px-3 text-sm outline-none"
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
                    className="min-h-20 rounded-[1.1rem] bg-white"
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
                  <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_120px_120px]">
                    <Input
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
                      className="h-11 rounded-2xl border border-input bg-white px-3 text-sm outline-none"
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
                      className="min-h-20 rounded-[1.1rem] bg-white"
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
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
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
            className="w-full rounded-full"
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
          >
            {createAutomationMutation.isPending ? "Saving..." : "Create automation"}
          </Button>
        </Card>

        <Card className="space-y-4 border-white/60 bg-white/78 p-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Automation registry</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "active", "paused", "archived"] as const).map((status) => (
                <Button
                  key={status}
                  className="rounded-full"
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
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <Input
              placeholder="Test run contact id"
              value={testContactId}
              onChange={(event) => setTestContactId(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Use a real V1 contact id to launch a manual run from the registry.
            </p>
          </div>

          {automations.map((automation) => (
            <div className="rounded-[1.5rem] bg-[#faf7ef] p-4" key={automation._id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{automation.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {automation.description || "No description yet."}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {automation.trigger.type} | {automation.status} | {automation.steps.length} steps
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {automation.status !== "active" ? (
                    <Button
                      className="rounded-full"
                      size="sm"
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        lifecycleMutation.mutate({ action: "activate", automationId: automation._id })
                      }
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Activate
                    </Button>
                  ) : null}
                  {automation.status === "active" ? (
                    <Button
                      className="rounded-full"
                      size="sm"
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        lifecycleMutation.mutate({ action: "pause", automationId: automation._id })
                      }
                    >
                      <PauseCircle className="mr-2 h-4 w-4" />
                      Pause
                    </Button>
                  ) : null}
                  {automation.status !== "archived" ? (
                    <Button
                      className="rounded-full"
                      size="sm"
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        lifecycleMutation.mutate({ action: "archive", automationId: automation._id })
                      }
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </Button>
                  ) : null}
                  <Button
                    className="rounded-full"
                    disabled={!testContactId.trim() || testAutomationMutation.isPending}
                    size="sm"
                    type="button"
                    onClick={() =>
                      testAutomationMutation.mutate({
                        automationId: automation._id,
                        payload: {
                          contactId: testContactId.trim(),
                        },
                      })
                    }
                  >
                    Run test
                  </Button>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Conditions
                  </p>
                  <div className="mt-2 space-y-2">
                    {automation.conditions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No conditions. Trigger alone starts the run.</p>
                    ) : (
                      automation.conditions.map((condition, index) => (
                        <div className="rounded-[1.1rem] bg-white px-3 py-2 text-sm" key={index}>
                          {condition.source} {condition.operator}
                          {condition.value ? ` ${condition.value}` : ""}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Steps
                  </p>
                  <div className="mt-2 space-y-2">
                    {automation.steps.map((step, index) => (
                      <div className="rounded-[1.1rem] bg-white px-3 py-2 text-sm" key={index}>
                        {index + 1}. {step.type}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {automations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No automations match this filter yet.</p>
          ) : null}
        </Card>
      </section>
    </div>
  );
}
