import React from "react";
import type { useTasksOrchestration } from "../hooks/useTasksOrchestration";
import { TaskCreateCard } from "./TaskCreateCard";
import { TasksHeader } from "./TasksHeader";
import { TasksRegistryCard } from "./TasksRegistryCard";

export interface TasksShellProps {
  orchestration: ReturnType<typeof useTasksOrchestration>;
}

export const TasksShell: React.FC<TasksShellProps> = ({ orchestration }) => {
  const {
    title,
    setTitle,
    contactId,
    setContactId,
    dueDate,
    setDueDate,
    priority,
    setPriority,
    statusFilter,
    setStatusFilter,
    createTaskMutation,
    tasks,
    overdueTasks,
    handleCreateTask,
    handleCompleteTask,
    handleCancelTask,
  } = orchestration;

  return (
    <div className="space-y-4">
      <TasksHeader overdueTasks={overdueTasks} totalTasks={tasks.length} />

      <section className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
        <TaskCreateCard
          contactId={contactId}
          dueDate={dueDate}
          isCreating={createTaskMutation.isPending}
          onContactIdChange={setContactId}
          onCreateTask={handleCreateTask}
          onDueDateChange={setDueDate}
          onPriorityChange={setPriority}
          onTitleChange={setTitle}
          priority={priority}
          title={title}
        />

        <TasksRegistryCard
          onCancelTask={handleCancelTask}
          onCompleteTask={handleCompleteTask}
          onStatusFilterChange={setStatusFilter}
          statusFilter={statusFilter}
          tasks={tasks}
        />
      </section>
    </div>
  );
};
