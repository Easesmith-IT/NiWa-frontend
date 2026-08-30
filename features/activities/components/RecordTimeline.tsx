"use client";

import React, { useState } from "react";
import {
  Phone,
  Mail,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  Plus,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { ActivityRecord, ActivityRecordType } from "../activity.types";
import { useRecordActivitiesQuery } from "../activity.queries";
import { useTasksQuery } from "../../tasks/task.queries";
import { LinkedRecordType } from "../../tasks/task.types";
import { LogActivityModal } from "./LogActivityModal";
import { TaskFormModal } from "../../tasks/components/TaskFormModal";

interface RecordTimelineProps {
  recordType: ActivityRecordType;
  recordId: string;
}

export const RecordTimeline: React.FC<RecordTimelineProps> = ({ recordType, recordId }) => {
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const { data: activitiesRes, isLoading: isActLoading, isError: isActError } = useRecordActivitiesQuery(
    recordType,
    recordId,
  );
  const { data: tasksRes, isLoading: isTaskLoading, isError: isTaskError } = useTasksQuery({
    recordType: recordType as LinkedRecordType,
    recordId,
  });

  const activities = activitiesRes?.data || [];
  const tasks = tasksRes?.data || [];

  const isLoading = isActLoading || isTaskLoading;
  const isError = isActError || isTaskError;

  // Combine items for unified presentation while preserving domain distinction
  const combinedTimeline = [
    ...activities.map((a) => ({
      kind: "ACTIVITY" as const,
      id: a._id,
      type: a.type,
      subject: a.subject || a.type,
      description: a.description,
      actorName: a.actorName || "User",
      timestamp: a.createdAt ? new Date(a.createdAt) : new Date(),
    })),
    ...tasks.map((t) => ({
      kind: "TASK" as const,
      id: t._id,
      type: t.status,
      subject: t.title,
      description: t.description,
      actorName: t.status === "COMPLETED" ? "Completed" : "Task",
      timestamp: t.createdAt ? new Date(t.createdAt) : new Date(),
      status: t.status,
      dueAt: t.dueAt,
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const getActivityIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "CALL":
        return Phone;
      case "EMAIL":
        return Mail;
      case "MEETING":
        return Users;
      case "NOTE":
        return FileText;
      case "TASK_COMPLETED":
        return CheckCircle2;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Activity & Task Timeline
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsActivityModalOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            Log Activity
          </button>
          <button
            type="button"
            onClick={() => setIsTaskModalOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading timeline...</div>
      ) : isError ? (
        <div className="p-4 text-xs text-red-500 bg-red-50 dark:bg-red-950/40 rounded-md border border-red-200 dark:border-red-800">
          Unable to load timeline data.
        </div>
      ) : combinedTimeline.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
          No activities or tasks logged for this record yet.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {combinedTimeline.map((item) => {
            const Icon = item.kind === "TASK" ? Calendar : getActivityIcon(item.type);
            const isTask = item.kind === "TASK";
            return (
              <div key={`${item.kind}-${item.id}`} className="relative group">
                <div
                  className={`absolute -left-6 top-0.5 flex items-center justify-center w-5 h-5 rounded-full border bg-white dark:bg-slate-900 ${
                    isTask
                      ? "border-indigo-500 text-indigo-500"
                      : "border-slate-300 dark:border-slate-700 text-slate-500"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {item.subject}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {item.timestamp.toLocaleString()}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <span className="uppercase px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                      {item.kind} • {item.type}
                    </span>
                    <span>by {item.actorName}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <LogActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        targetRecordType={recordType}
        targetRecordId={recordId}
      />

      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        defaultLinkedRecord={{ recordType: recordType as LinkedRecordType, recordId }}
      />
    </div>
  );
};
