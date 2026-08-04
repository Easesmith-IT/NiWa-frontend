"use client";

import { useMemo, useState } from "react";
import { Ban, CheckCircle2, ListTodo } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  useCancelTaskV1Mutation,
  useCompleteTaskV1Mutation,
  useCreateTaskV1Mutation,
  useTasksV1Query,
} from "../../../features/tasks";

const formatDateInputToIso = (value: string) => {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T09:00:00.000Z`).toISOString();
};

export default function TasksPage() {
  const [title, setTitle] = useState("");
  const [contactId, setContactId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"high" | "low" | "medium">("medium");
  const [statusFilter, setStatusFilter] = useState<"all" | "cancelled" | "completed" | "todo">("all");

  const tasksQuery = useTasksV1Query(statusFilter === "all" ? undefined : { status: statusFilter });
  const createTaskMutation = useCreateTaskV1Mutation();
  const completeTaskMutation = useCompleteTaskV1Mutation();
  const cancelTaskMutation = useCancelTaskV1Mutation();

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

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Follow-up Task Ledger
            </h1>
            <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
              Operator task tracking linked directly to customer conversations and CRM records.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Visible</p>
              <p className="mt-1 text-xl font-bold text-foreground">{tasks.length}</p>
            </div>
            <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Overdue</p>
              <p className="mt-1 text-xl font-bold text-[#C2413A]">{overdueTasks}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
        <Card className="space-y-3.5 p-4">
          <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2.5">
            <ListTodo className="h-4 w-4 text-[#176B4D]" />
            <h2 className="text-sm font-semibold text-foreground">Create Task</h2>
          </div>
          <Input
            onChange={(event) => setContactId(event.target.value)}
            placeholder="Contact ID (V1 / Phone)"
            value={contactId}
          />
          <Input
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Task title..."
            value={title}
          />
          <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-2">
            <Input
              onChange={(event) => setDueDate(event.target.value)}
              type="date"
              value={dueDate}
            />
            <select
              className="h-8.5 rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary"
              onChange={(event) => setPriority(event.target.value as "high" | "low" | "medium")}
              value={priority}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <Button
            className="w-full font-medium"
            disabled={!contactId.trim() || !title.trim() || createTaskMutation.isPending}
            onClick={() =>
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
              )
            }
            type="button"
            variant="primary"
          >
            {createTaskMutation.isPending ? "Creating..." : "Create Task"}
          </Button>
        </Card>

        <Card className="space-y-3.5 p-4">
          <div className="flex flex-wrap gap-1.5 border-b border-[#F0F0F2] pb-2.5">
            {(["all", "todo", "completed", "cancelled"] as const).map((status) => (
              <Button
                key={status}
                onClick={() => setStatusFilter(status)}
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
              <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3.5" key={task._id}>
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
                        onClick={() => completeTaskMutation.mutate(task._id)}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#16803C]" />
                        Complete
                      </Button>
                      <Button
                        onClick={() => cancelTaskMutation.mutate(task._id)}
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
            ))}
          </div>
          {tasks.length === 0 ? (
            <p className="text-xs text-muted-foreground">No tasks match this filter.</p>
          ) : null}
        </Card>
      </section>
    </div>
  );
}

