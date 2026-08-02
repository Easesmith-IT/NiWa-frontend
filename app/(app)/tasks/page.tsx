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
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,rgba(20,54,46,0.96),rgba(43,83,69,0.86))] p-6 text-[#f8f1de] shadow-[0_20px_60px_rgba(13,29,24,0.28)]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c29b]">Tasks</p>
            <h1 className="mt-2 text-3xl font-semibold">Follow-up ledger</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#d9e6dd]">
              Tasks are now first-class operator records with due dates, status control, and
              contact-linked context.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-[1.4rem] bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-[#d4c29b]">Visible</p>
              <p className="mt-2 text-2xl font-semibold">{tasks.length}</p>
            </div>
            <div className="rounded-[1.4rem] bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-[#d4c29b]">Overdue</p>
              <p className="mt-2 text-2xl font-semibold">{overdueTasks}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
        <Card className="space-y-4 border-white/60 bg-white/78 p-5 backdrop-blur">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Create task</h2>
          </div>
          <Input
            onChange={(event) => setContactId(event.target.value)}
            placeholder="Contact id"
            value={contactId}
          />
          <Input
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Task title"
            value={title}
          />
          <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-2">
            <Input
              onChange={(event) => setDueDate(event.target.value)}
              type="date"
              value={dueDate}
            />
            <select
              className="h-11 rounded-2xl border border-input bg-[#faf7ef] px-3 text-sm outline-none"
              onChange={(event) => setPriority(event.target.value as "high" | "low" | "medium")}
              value={priority}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <Button
            className="w-full rounded-full"
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
          >
            {createTaskMutation.isPending ? "Creating..." : "Create task"}
          </Button>
        </Card>

        <Card className="space-y-4 border-white/60 bg-white/78 p-5 backdrop-blur">
          <div className="flex flex-wrap gap-2">
            {(["all", "todo", "completed", "cancelled"] as const).map((status) => (
              <Button
                className="rounded-full"
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
          {tasks.map((task) => (
            <div className="rounded-[1.4rem] bg-[#faf7ef] p-4" key={task._id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{task.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Contact: {task.contactId}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {task.priority} priority | {task.status}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Due: {task.dueAt ? new Date(task.dueAt).toLocaleDateString() : "No due date"}
                  </p>
                  {task.description ? (
                    <p className="mt-2 text-sm text-muted-foreground">{task.description}</p>
                  ) : null}
                </div>
                {task.status === "todo" ? (
                  <div className="flex flex-col gap-2">
                    <Button
                      className="rounded-full"
                      onClick={() => completeTaskMutation.mutate(task._id)}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Complete
                    </Button>
                    <Button
                      className="rounded-full"
                      onClick={() => cancelTaskMutation.mutate(task._id)}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks match this filter yet.</p>
          ) : null}
        </Card>
      </section>
    </div>
  );
}
