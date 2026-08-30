"use client";

import React from "react";
import { X, CheckCircle2, Clock, Calendar, User, Tag, Trash2, Edit3, Link as LinkIcon } from "lucide-react";
import { TaskRecord } from "../task.types";
import { useCompleteTaskMutation, useDeleteTaskMutation } from "../task.queries";

interface TaskDetailModalProps {
  task: TaskRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: TaskRecord) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
}) => {
  const completeTaskMutation = useCompleteTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();

  if (!isOpen || !task) return null;

  const isCompleted = task.status === "COMPLETED";

  const handleComplete = async () => {
    await completeTaskMutation.mutateAsync(task._id);
    onClose();
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTaskMutation.mutateAsync(task._id);
      onClose();
    }
  };

  const priorityColor =
    task.priority?.toUpperCase() === "HIGH"
      ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800"
      : task.priority?.toUpperCase() === "MEDIUM"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800"
        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${priorityColor}`}
            >
              {task.priority || "MEDIUM"}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${
                isCompleted
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800"
              }`}
            >
              {task.status}
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {task.title}
        </h3>

        {task.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            {task.description}
          </p>
        )}

        <div className="space-y-3 mb-6 text-sm text-slate-600 dark:text-slate-300">
          {task.dueAt && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Due: {new Date(task.dueAt).toLocaleString()}</span>
            </div>
          )}
        </div>

        {task.linkedRecords && task.linkedRecords.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mb-6">
            <h4 className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500 mb-2">
              Linked Records
            </h4>
            <div className="flex flex-wrap gap-2">
              {task.linkedRecords.map((rec, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-semibold">{rec.recordType}:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    {rec.recordId}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>

            {!isCompleted && (
              <button
                type="button"
                onClick={handleComplete}
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-500 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
