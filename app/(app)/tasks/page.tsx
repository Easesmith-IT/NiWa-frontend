"use client";

import { TasksShell, useTasksOrchestration } from "../../../features/tasks";

export default function TasksPage() {
  const orchestration = useTasksOrchestration();
  return <TasksShell orchestration={orchestration} />;
}
