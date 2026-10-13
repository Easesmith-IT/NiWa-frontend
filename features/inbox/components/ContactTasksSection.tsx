import { Check, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { formatDateInput } from "../utils/formatters";
import { PanelSection } from "./PanelSection";

const priorityOptions = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
] as const;

export interface TaskItem {
  _id: string;
  dueAt?: string | null;
  priority: string;
  status: string;
  title: string;
}

export interface ContactTasksSectionProps {
  tasks: TaskItem[];
  taskTitle: string;
  onTaskTitleChange: (val: string) => void;
  taskDueDate: string;
  onTaskDueDateChange: (val: string) => void;
  taskPriority: "high" | "low" | "medium";
  onTaskPriorityChange: (val: "high" | "low" | "medium") => void;
  onAddTask: () => void;
  isCreatingTask: boolean;
  onCompleteTask: (taskId: string) => void;
  isCompletingTask: boolean;
  }

export function ContactTasksSection({
  tasks,
  taskTitle,
  onTaskTitleChange,
  taskDueDate,
  onTaskDueDateChange,
  taskPriority,
  onTaskPriorityChange,
  onAddTask,
  isCreatingTask,
  onCompleteTask,
  isCompletingTask,
  }: ContactTasksSectionProps) {
  return (
    <PanelSection title="Tasks">
      <div className="space-y-2.5">
        <Input
          className="h-8 text-xs"
          onChange={(event) => onTaskTitleChange(event.target.value)}
          placeholder="Create task"
          value={taskTitle}
        />
        <div className="grid grid-cols-[minmax(0,1fr)_100px] gap-2">
          <Input
            className="h-8 text-xs"
            onChange={(event) => onTaskDueDateChange(event.target.value)}
            type="date"
            value={taskDueDate}
          />
          <select
            className="h-8 rounded-md border border-[#E4E4E7] bg-white px-2 text-xs text-foreground outline-none dark:border-[#303438] dark:bg-[#17191B]"
            onChange={(event) => onTaskPriorityChange(event.target.value as "high" | "low" | "medium")}
            value={taskPriority}
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Button
          className="w-full text-xs"
          disabled={!taskTitle.trim() || isCreatingTask}
          onClick={onAddTask}
          size="sm"
          type="button"
          variant="outline"
        >
          Add task
        </Button>
      </div>
      <div className="mt-3 space-y-2.5">
        {tasks.map((task) => (
          <div className="rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#282B2E] dark:bg-[#17191B]" key={task._id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-foreground">{task.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {task.priority} • {task.status}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Due {task.dueAt ? formatDateInput(task.dueAt) : "unscheduled"}
                </p>
              </div>
              {task.status === "todo" ? (
                <div className="flex gap-1">
                  <button
                    className="rounded-md p-1 text-muted-foreground transition hover:bg-[#F4F4F5] hover:text-foreground dark:hover:bg-[#25282B]"
                    disabled={isCompletingTask}
                    onClick={() => onCompleteTask(task._id)}
                    type="button"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
        {tasks.length === 0 ? <p className="text-xs text-muted-foreground">No tasks yet.</p> : null}
      </div>
    </PanelSection>
  );
}
