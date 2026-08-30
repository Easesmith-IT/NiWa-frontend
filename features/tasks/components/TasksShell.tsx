"use client";

import React from "react";
import type { useTasksOrchestration } from "../hooks/useTasksOrchestration";
import { TaskCreateCard } from "./TaskCreateCard";
import { TasksHeader } from "./TasksHeader";
import { TasksRegistryCard } from "./TasksRegistryCard";
import { TaskFormModal } from "./TaskFormModal";
import { TaskDetailModal } from "./TaskDetailModal";

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
    selectedTask,
    isFormOpen,
    setIsFormOpen,
    isDetailOpen,
    setIsDetailOpen,
    handleSelectTask,
    handleOpenEdit,
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
          onCompleteTask={handleCompleteTask}
          onClickTask={handleSelectTask}
          onStatusFilterChange={setStatusFilter}
          statusFilter={statusFilter}
          tasks={tasks}
        />
      </section>

      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleOpenEdit}
      />

      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={selectedTask}
      />
    </div>
  );
};
