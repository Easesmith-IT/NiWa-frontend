import React from "react";
import { Ban, CheckCircle2, Link as LinkIcon } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { TaskRecord } from "../task.types";

export interface TaskItemCardProps {
  task: TaskRecord;
  onCompleteTask: (taskId: string) => void;
  onClickTask?: (task: TaskRecord) => void;
}

export const TaskItemCard: React.FC<TaskItemCardProps> = ({
  task,
  onCompleteTask,
  onClickTask,
}) => {
  const isPending = task.status === "PENDING";

  return (
    <div
      onClick={() => onClickTask && onClickTask(task)}
      className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3.5 dark:border-[#292C2F] dark:bg-[#17191B] hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-semibold text-foreground">{task.title}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {task.priority} priority • {task.status}
          </p>

          {task.dueAt && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Due: {new Date(task.dueAt).toLocaleString()}
            </p>
          )}

          {task.description ? (
            <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
          ) : null}

          {task.linkedRecords && task.linkedRecords.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {task.linkedRecords.map((rec, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <LinkIcon className="w-2.5 h-2.5" />
                  <span>{rec.recordType}:</span>
                  <span className="font-mono">{rec.recordId.slice(-6)}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {isPending ? (
          <div className="flex flex-col gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button
              onClick={() => onCompleteTask(task._id)}
              size="sm"
              type="button"
              variant="secondary"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-[#16803C] dark:text-[#3FA66F]" />
              Complete
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
