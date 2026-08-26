import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import type { AutomationStepRecord } from "../automation.types";

export interface AutomationStepEditorProps {
  steps: AutomationStepRecord[];
  onAddStep: () => void;
  onUpdateStepType: (index: number, type: AutomationStepRecord["type"]) => void;
  onUpdateStepConfig: (index: number, config: Record<string, unknown>) => void;
}

export const AutomationStepEditor: React.FC<AutomationStepEditorProps> = ({
  steps,
  onAddStep,
  onUpdateStepType,
  onUpdateStepConfig,
}) => {
  return (
    <div className="space-y-2.5 rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#292C2F] dark:bg-[#17191B]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-foreground">Steps</p>
        <Button
          size="sm"
          type="button"
          variant="secondary"
          onClick={onAddStep}
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
              onUpdateStepType(
                index,
                event.target.value as AutomationStepRecord["type"],
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
                onUpdateStepConfig(index, { body: event.target.value })
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
                  onUpdateStepConfig(index, {
                    ...step.config,
                    title: event.target.value,
                  })
                }
              />
              <Input
                className="bg-white dark:bg-[#17191B]"
                placeholder="Due in min"
                type="number"
                value={String(step.config.dueInMinutes ?? 60)}
                onChange={(event) =>
                  onUpdateStepConfig(index, {
                    ...step.config,
                    dueInMinutes: Number(event.target.value || 0),
                  })
                }
              />
              <select
                className="h-8.5 rounded-md border border-[#D4D4D8] bg-white px-2 text-xs text-foreground outline-none dark:border-[#303438] dark:bg-[#17191B]"
                value={String(step.config.priority ?? "medium")}
                onChange={(event) =>
                  onUpdateStepConfig(index, {
                    ...step.config,
                    priority: event.target.value,
                  })
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
                  onUpdateStepConfig(index, {
                    ...step.config,
                    content: event.target.value,
                  })
                }
              />
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={Boolean(step.config.pinned)}
                  onChange={(event) =>
                    onUpdateStepConfig(index, {
                      ...step.config,
                      pinned: event.target.checked,
                    })
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
                onUpdateStepConfig(index, {
                  delayMinutes: Number(event.target.value || 0),
                })
              }
            />
          ) : null}
        </div>
      ))}
    </div>
  );
};
