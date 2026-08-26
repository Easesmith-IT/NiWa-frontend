"use client";

import { useMemo, useState } from "react";
import {
  useCancelTaskMutation,
  useCompleteTaskMutation,
  useCreateTaskMutation,
  useTasksQuery,
} from "../task.queries";

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
  const [statusFilter, setStatusFilter] = useState<"all" | "cancelled" | "completed" | "todo">("all");

  const tasksQuery = useTasksQuery(statusFilter === "all" ? undefined : { status: statusFilter });
  const createTaskMutation = useCreateTaskMutation();
  const completeTaskMutation = useCompleteTaskMutation();
  const cancelTaskMutation = useCancelTaskMutation();

  const tasks = tasksQuery.data?.data ?? [];
  const overdueTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.status === "todo" &&
          task.dueAt &&
          new Date(task.dueAt).getTime() < new Date("2026-08-02T00:00:00.000Z").getTime(),
      ).length,
    [tasks],
  );

  const handleCreateTask = () => {
    if (!contactId.trim() || !title.trim() || createTaskMutation.isPending) return;

    createTaskMutation.mutate(
      {
        contactId: contactId.trim(),
        dueAt: formatDateInputToIso(dueDate),
        priority,
        title: title.trim(),
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

  const handleCancelTask = (taskId: string) => {
    cancelTaskMutation.mutate(taskId);
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
    cancelTaskMutation,
    tasks,
    overdueTasks,
    handleCreateTask,
    handleCompleteTask,
    handleCancelTask,
  };
}
