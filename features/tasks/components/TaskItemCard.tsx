import React from "react";
import { Ban, CheckCircle2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { TaskRecord } from "../task.types";

export interface TaskItemCardProps {
  task: TaskRecord;
  onCompleteTask: (taskId: string) => void;
  onCancelTask: (taskId: string) => void;
}

export const TaskItemCard: React.FC<TaskItemCardProps> = ({
  task,
  onCompleteTask,
  onCancelTask,
}) => {
  return (
    <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3.5 dark:border-[#292C2F] dark:bg-[#17191B]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-foreground">{task.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">Contact: <span className="font-mono text-foreground">{task.contactId}</span></p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {task.priority} priority • {task.status}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Due: {task.dueAt ? new Date(task.dueAt).toLocaleDateString() : "No due date"}
          </p>
          {task.description ? (
            <p className="mt-1.5 text-xs text-muted-foreground">{task.description}</p>
          ) : null}
        </div>
        {task.status === "todo" ? (
          <div className="flex flex-col gap-1.5">
            <Button
              onClick={() => onCompleteTask(task._id)}
              size="sm"
              type="button"
              variant="secondary"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-[#16803C] dark:text-[#3FA66F]" />
              Complete
            </Button>
            <Button
              onClick={() => onCancelTask(task._id)}
              size="sm"
              type="button"
              variant="secondary"
            >
              <Ban className="h-3.5 w-3.5" />
              Cancel
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
