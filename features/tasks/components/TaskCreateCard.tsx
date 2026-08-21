import React from "react";
import { ListTodo } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";

export interface TaskCreateCardProps {
  contactId: string;
  onContactIdChange: (value: string) => void;
  title: string;
  onTitleChange: (value: string) => void;
  dueDate: string;
  onDueDateChange: (value: string) => void;
  priority: "high" | "low" | "medium";
  onPriorityChange: (value: "high" | "low" | "medium") => void;
  isCreating: boolean;
  onCreateTask: () => void;
}

export const TaskCreateCard: React.FC<TaskCreateCardProps> = ({
  contactId,
  onContactIdChange,
  title,
  onTitleChange,
  dueDate,
  onDueDateChange,
  priority,
  onPriorityChange,
  isCreating,
  onCreateTask,
}) => {
  return (
    <Card className="space-y-3.5 p-4">
      <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2.5 dark:border-[#202326]">
        <ListTodo className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
        <h2 className="text-sm font-semibold text-foreground">Create Task</h2>
      </div>
      <Input
        onChange={(event) => onContactIdChange(event.target.value)}
        placeholder="Contact ID (V1 / Phone)"
        value={contactId}
      />
      <Input
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Task title..."
        value={title}
      />
      <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-2">
        <Input
          onChange={(event) => onDueDateChange(event.target.value)}
          type="date"
          value={dueDate}
        />
        <select
          className="h-8.5 rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#17191B]"
          onChange={(event) => onPriorityChange(event.target.value as "high" | "low" | "medium")}
          value={priority}
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <Button
        className="w-full font-medium"
        disabled={!contactId.trim() || !title.trim() || isCreating}
        onClick={onCreateTask}
        type="button"
        variant="primary"
      >
        {isCreating ? "Creating..." : "Create Task"}
      </Button>
    </Card>
  );
};
