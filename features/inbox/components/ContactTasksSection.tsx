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
  onCancelTask: (taskId: string) => void;
  isCancelingTask: boolean;
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
  onCancelTask,
  isCancelingTask,
}: ContactTasksSectionProps) {
  return (
    <PanelSection title="Tasks">
      <div className="space-y-3">
        <Input
          className="border-[#ddd2c3] bg-white text-[#25342f]"
          onChange={(event) => onTaskTitleChange(event.target.value)}
          placeholder="Create task"
          value={taskTitle}
        />
        <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-2">
          <Input
            className="border-[#ddd2c3] bg-white text-[#25342f]"
            onChange={(event) => onTaskDueDateChange(event.target.value)}
            type="date"
            value={taskDueDate}
          />
          <select
            className="h-10 rounded-lg border border-[#ddd2c3] bg-white px-3 text-sm text-[#25342f] outline-none"
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
          className="w-full border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
          disabled={!taskTitle.trim() || isCreatingTask}
          onClick={onAddTask}
          type="button"
          variant="secondary"
        >
          Add task
        </Button>
      </div>
      <div className="mt-4 space-y-3">
        {tasks.map((task) => (
          <div className="rounded-xl bg-white px-4 py-4" key={task._id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#25342f]">{task.title}</p>
                <p className="mt-1 text-xs text-[#7a8b82]">
                  {task.priority} • {task.status}
                </p>
                <p className="mt-1 text-xs text-[#7a8b82]">
                  Due {task.dueAt ? formatDateInput(task.dueAt) : "unscheduled"}
                </p>
              </div>
              {task.status === "todo" ? (
                <div className="flex gap-1">
                  <button
                    className="rounded-full p-1.5 text-[#6f7f75] transition hover:bg-[#f3ede4] hover:text-[#25342f]"
                    disabled={isCompletingTask}
                    onClick={() => onCompleteTask(task._id)}
                    type="button"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-full p-1.5 text-[#6f7f75] transition hover:bg-[#f3ede4] hover:text-[#25342f]"
                    disabled={isCancelingTask}
                    onClick={() => onCancelTask(task._id)}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
        {tasks.length === 0 ? <p className="text-sm text-[#7a8b82]">No tasks yet.</p> : null}
      </div>
    </PanelSection>
  );
}
