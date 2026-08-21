import React from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import type { TaskRecordV1 } from "../task.types";
import { TaskItemCard } from "./TaskItemCard";

export interface TasksRegistryCardProps {
  statusFilter: "all" | "cancelled" | "completed" | "todo";
  onStatusFilterChange: (status: "all" | "cancelled" | "completed" | "todo") => void;
  tasks: TaskRecordV1[];
  onCompleteTask: (taskId: string) => void;
  onCancelTask: (taskId: string) => void;
}

export const TasksRegistryCard: React.FC<TasksRegistryCardProps> = ({
  statusFilter,
  onStatusFilterChange,
  tasks,
  onCompleteTask,
  onCancelTask,
}) => {
  return (
    <Card className="space-y-3.5 p-4">
      <div className="flex flex-wrap gap-1.5 border-b border-[#F0F0F2] pb-2.5 dark:border-[#202326]">
        {(["all", "todo", "completed", "cancelled"] as const).map((status) => (
          <Button
            key={status}
            onClick={() => onStatusFilterChange(status)}
            size="sm"
            type="button"
            variant={statusFilter === status ? "primary" : "secondary"}
          >
            {status}
          </Button>
        ))}
      </div>
      <div className="space-y-2.5">
        {tasks.map((task) => (
          <TaskItemCard
            key={task._id}
            onCancelTask={onCancelTask}
            onCompleteTask={onCompleteTask}
            task={task}
          />
        ))}
      </div>
      {tasks.length === 0 ? (
        <p className="text-xs text-muted-foreground">No tasks match this filter.</p>
      ) : null}
    </Card>
  );
};
