"use client";

import React from "react";
import { ArrowLeft, ArrowRight, Calendar, Clock, Globe, Send } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

interface Step5Props {
  scheduleType: "now" | "scheduled";
  setScheduleType: (type: "now" | "scheduled") => void;
  scheduledAt: string;
  setScheduledAt: (val: string) => void;
  timezone: string;
  setTimezone: (tz: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step5Schedule: React.FC<Step5Props> = ({
  scheduleType,
  setScheduleType,
  scheduledAt,
  setScheduledAt,
  timezone,
  setTimezone,
  onNext,
  onBack,
}) => {
  const [error, setError] = React.useState("");

  // Default to tomorrow 09:00 if empty
  React.useEffect(() => {
    if (!scheduledAt) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      setScheduledAt(tomorrow.toISOString().slice(0, 16));
    }
  }, [scheduledAt, setScheduledAt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduleType === "scheduled") {
      if (!scheduledAt) {
        setError("Please pick a scheduled date and time.");
        return;
      }
      const chosenDate = new Date(scheduledAt);
      if (chosenDate <= new Date()) {
        setError("Scheduled execution time must be in the future.");
        return;
      }
    }
    setError("");
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Calendar className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Step 5: Campaign Schedule</h2>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Decide whether to dispatch your WhatsApp campaign immediately or schedule it for a future timestamp.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setScheduleType("now")}
          className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
            scheduleType === "now"
              ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20"
              : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
        >
          <div
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
              scheduleType === "now" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"
            }`}
          >
            <Send className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Send Immediately</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Messages will begin materializing and processing as soon as you launch the campaign.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setScheduleType("scheduled")}
          className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
            scheduleType === "scheduled"
              ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20"
              : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
        >
          <div
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
              scheduleType === "scheduled" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Schedule for Later</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Pick a future date, time, and timezone. The backend scheduler will trigger dispatch automatically.
            </p>
          </div>
        </button>
      </div>

      {scheduleType === "scheduled" && (
        <div className="rounded-xl border bg-gray-50/60 p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Scheduled Execution Time</label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => {
                  setScheduledAt(e.target.value);
                  if (e.target.value) setError("");
                }}
                className="w-full text-xs"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Timezone</label>
              <div className="relative">
                <Input
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="e.g. Asia/Kolkata or UTC"
                  className="w-full text-xs pr-8"
                />
                <Globe className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {scheduledAt && (
            <div className="rounded-lg bg-white p-3 text-xs text-gray-600 border border-gray-200">
              <span className="font-semibold text-gray-900">Target Launch: </span>
              {new Date(scheduledAt).toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short",
              })}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}

      <div className="flex items-center justify-between border-t pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
          Continue to Review & Launch
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};
