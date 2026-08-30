"use client";

import { useMemo, useState } from "react";
import {
  useCompleteTaskMutation,
  useCreateTaskMutation,
  useTasksQuery,
} from "../task.queries";
import { TaskRecord, TaskPriority } from "../task.types";

export const formatDateInputToIso = (value: string) => {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T09:00:00.000Z`).toISOString();
};

export function useTasksOrchestration() {
  const [title, setTitle] = useState("");
  const [contactId, setContactId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"high" | "low" | "medium">("medium");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "todo" | "archived">("all");
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filterInput =
    statusFilter === "all"
      ? undefined
      : statusFilter === "todo"
        ? { status: "PENDING" }
        : statusFilter === "archived"
          ? { isArchived: "true" }
          : { status: statusFilter.toUpperCase() };

  const tasksQuery = useTasksQuery(filterInput);
  const createTaskMutation = useCreateTaskMutation();
  const completeTaskMutation = useCompleteTaskMutation();
  const tasks = tasksQuery.data?.data ?? [];
  const overdueTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.status === "PENDING" &&
          task.dueAt &&
          new Date(task.dueAt).getTime() < Date.now(),
      ).length,
    [tasks],
  );

  const handleCreateTask = () => {
    if (!title.trim() || createTaskMutation.isPending) return;

    createTaskMutation.mutate(
      {
        title: title.trim(),
        description: "",
        dueAt: formatDateInputToIso(dueDate),
        priority: priority.toUpperCase() as TaskPriority,
        contactId: contactId.trim() || undefined,
      },
      {
        onSuccess: () => {
          setContactId("");
          setTitle("");
          setDueDate("");
          setPriority("medium");
        },
      },
    );
  };

  const handleCompleteTask = (taskId: string) => {
    completeTaskMutation.mutate(taskId);
  };

  const handleSelectTask = (task: TaskRecord) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleOpenEdit = (task: TaskRecord) => {
    setSelectedTask(task);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  return {
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
    tasksQuery,
    createTaskMutation,
    completeTaskMutation,
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
  };
}
