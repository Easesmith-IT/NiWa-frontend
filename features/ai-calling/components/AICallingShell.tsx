"use client";

import { useMemo, useState } from "react";
import { PhoneCall, PhoneOutgoing, Settings2, RefreshCw } from "lucide-react";
import {
  useAICallingCalls,
  useAICallingNumbers,
  useSaveAICallingNumber,
  useStartAICall,
} from "../ai-calling.queries";

const statusLabel: Record<string, string> = {
  initiated: "Initiated",
  ringing: "Ringing",
  in_progress: "In progress",
  completed: "Completed",
  busy: "Busy",
  no_answer: "No answer",
  failed: "Failed",
  canceled: "Canceled",
};

export function AICallingShell() {
  const callsQuery = useAICallingCalls();
  const numbersQuery = useAICallingNumbers();
  const saveNumber = useSaveAICallingNumber();
  const startCall = useStartAICall();

  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [greeting, setGreeting] = useState("");
  const [newNumber, setNewNumber] = useState("");

  const numbers = numbersQuery.data?.numbers ?? [];
  const selectedFrom = from || numbers.find((n) => n.enabled)?.phoneNumberE164 || "";
  const calls = useMemo(() => callsQuery.data?.calls ?? [], [callsQuery.data]);

  const submitCall = async () => {
    if (!to.trim() || !selectedFrom) return;
    await startCall.mutateAsync({
      to: to.trim(),
      from: selectedFrom,
      greeting: greeting.trim() || undefined,
    });
    setTo("");
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Communication</p>
          <h1 className="text-2xl font-semibold tracking-tight">AI Calling</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Make and receive business calls with the workspace AI agent.
          </p>
        </div>
        <button
          type="button"
          onClick={() => callsQuery.refetch()}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2"><PhoneOutgoing className="h-5 w-5" /></div>
            <div>
              <h2 className="font-semibold">Start AI call</h2>
              <p className="text-sm text-muted-foreground">The selected business number is used as caller ID.</p>
            </div>
          </div>
          <div className="grid gap-4">
            <label className="grid gap-1.5 text-sm">
              Customer number
              <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="+919876543210" className="rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2" />
            </label>
            <label className="grid gap-1.5 text-sm">
              Business number
              <select value={selectedFrom} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border bg-background px-3 py-2">
                <option value="">Select a configured number</option>
                {numbers.map((n) => <option key={n._id} value={n.phoneNumberE164}>{n.label} · {n.phoneNumberE164}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm">
              Optional opening line
              <textarea value={greeting} onChange={(e) => setGreeting(e.target.value)} rows={2} placeholder="Namaste, this is the AI assistant from..." className="rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2" />
            </label>
            <button
              type="button"
              disabled={!to.trim() || !selectedFrom || startCall.isPending}
              onClick={submitCall}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PhoneCall className="h-4 w-4" /> {startCall.isPending ? "Starting..." : "Start AI call"}
            </button>
            {startCall.error && <p className="text-sm text-destructive">{(startCall.error as Error).message}</p>}
          </div>
        </div>

        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2"><Settings2 className="h-5 w-5" /></div>
            <div>
              <h2 className="font-semibold">Business numbers</h2>
              <p className="text-sm text-muted-foreground">Map a Twilio number to this workspace.</p>
            </div>
          </div>
          <div className="grid gap-3">
            {numbers.map((number) => (
              <div key={number._id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{number.label}</p>
                  <p className="text-xs text-muted-foreground">{number.phoneNumberE164}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs ${number.enabled ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                  {number.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            ))}
            {numbers.length === 0 && <p className="text-sm text-muted-foreground">No number configured yet.</p>}
            <div className="mt-2 flex gap-2">
              <input value={newNumber} onChange={(e) => setNewNumber(e.target.value)} placeholder="+919876543210" className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-2 text-sm" />
              <button
                type="button"
                disabled={!newNumber.trim() || saveNumber.isPending}
                onClick={() => saveNumber.mutate({ phoneNumberE164: newNumber.trim() }).then(() => setNewNumber(""))}
                className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                Add
              </button>
            </div>
            {saveNumber.error && <p className="text-sm text-destructive">{(saveNumber.error as Error).message}</p>}
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-background shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Recent calls</h2>
        </div>
        <div className="divide-y">
          {calls.map((call) => (
            <div key={call._id} className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-center">
              <div>
                <p className="text-sm font-medium">{call.direction === "outbound" ? call.toNumber : call.fromNumber}</p>
                <p className="text-xs text-muted-foreground">{new Date(call.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-sm text-muted-foreground">{call.direction === "outbound" ? "Outbound" : "Inbound"}</div>
              <span className="rounded-full bg-muted px-2 py-1 text-xs">{statusLabel[call.status] || call.status}</span>
              <span className="text-sm tabular-nums text-muted-foreground">{call.durationSeconds || 0}s</span>
            </div>
          ))}
          {calls.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted-foreground">No calls yet.</p>}
        </div>
      </section>
    </main>
  );
}
