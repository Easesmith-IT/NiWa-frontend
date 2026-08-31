"use client";

import React from "react";
import type { useTasksOrchestration } from "../hooks/useTasksOrchestration";
import { TaskCreateCard } from "./TaskCreateCard";
import { TasksHeader } from "./TasksHeader";
import { TasksRegistryCard } from "./TasksRegistryCard";
import { TaskFormModal } from "./TaskFormModal";
import { TaskDetailModal } from "./TaskDetailModal";
import { TaskItemCard } from "./TaskItemCard";
import { CrmPageShell } from "../../crm/components/CrmPageShell";

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
    setSelectedTask,
    isFormOpen,
    setIsFormOpen,
    isDetailOpen,
    setIsDetailOpen,
    handleSelectTask,
    handleOpenEdit,
  } = orchestration;

  return (
    <CrmPageShell
      breadcrumb="CRM / Tasks"
      title="Tasks Ledger"
      description="Operator task tracking linked directly to customer conversations and CRM records."
      primaryAction={
        <button
          onClick={() => {
            setSelectedTask(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-indigo-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          New Task
        </button>
      }
      viewContext={
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Visible</span>
            <span className="text-sm font-bold text-foreground">{tasks.length}</span>
          </div>
          <div className="flex flex-col border-l border-slate-200 pl-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Overdue</span>
            <span className="text-sm font-bold text-red-600">{overdueTasks}</span>
          </div>
        </div>
      }
      queryControls={
        <div className="flex flex-wrap gap-1.5">
          {(["all", "todo", "completed", "archived"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                statusFilter === status
                  ? "bg-slate-900 text-white shadow"
                  : "bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      }
      dataSurface={
        <div className="grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)] h-full overflow-hidden">
          <div className="border-r border-slate-200 bg-slate-50 p-4 overflow-y-auto">
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
          </div>
          <div className="p-4 overflow-y-auto bg-white">
            <div className="space-y-2.5">
              {tasks.map((task) => (
                <TaskItemCard
                  key={task._id}
                  onCompleteTask={handleCompleteTask}
                  onClickTask={handleSelectTask}
                  task={task}
                />
              ))}
            </div>
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-slate-500 text-center">
                <p className="text-sm font-semibold">No tasks found</p>
                <p className="text-xs mt-1">No tasks match the current filter.</p>
              </div>
            ) : null}
          </div>
        </div>
      }
    >
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
    </CrmPageShell>
  );
};
