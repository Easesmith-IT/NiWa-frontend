"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Calendar, User, AlertCircle } from "lucide-react";
import { LinkedRecordSelector } from "./LinkedRecordSelector";
import { CreateTaskPayload, LinkedRecord, TaskPriority, TaskRecord } from "../task.types";
import { useCreateTaskMutation, usePatchTaskMutation } from "../task.queries";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: TaskRecord | null;
  defaultLinkedRecord?: LinkedRecord;
}

interface FormValues {
  title: string;
  description: string;
  priority: TaskPriority;
  dueAt: string;
  assignedTo: string;
  linkedRecords: LinkedRecord[];
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  defaultLinkedRecord,
}) => {
  const isEditing = !!initialData;
  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = usePatchTaskMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      dueAt: "",
      assignedTo: "",
      linkedRecords: defaultLinkedRecord ? [defaultLinkedRecord] : [],
    },
  });

  const linkedRecords = watch("linkedRecords");

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || "",
        description: initialData.description || "",
        priority: initialData.priority || "MEDIUM",
        dueAt: initialData.dueAt ? new Date(initialData.dueAt).toISOString().slice(0, 16) : "",
        assignedTo: initialData.assignedTo || "",
        linkedRecords: initialData.linkedRecords || [],
      });
    } else {
      reset({
        title: "",
        description: "",
        priority: "MEDIUM",
        dueAt: "",
        assignedTo: "",
        linkedRecords: defaultLinkedRecord ? [defaultLinkedRecord] : [],
      });
    }
  }, [initialData, defaultLinkedRecord, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (values: FormValues) => {
    const payload: CreateTaskPayload = {
      title: values.title.trim(),
      description: values.description.trim(),
      priority: values.priority,
      dueAt: values.dueAt ? new Date(values.dueAt).toISOString() : null,
      assignedTo: values.assignedTo.trim() || null,
      linkedRecords: values.linkedRecords,
    };

    if (isEditing && initialData) {
      await updateTaskMutation.mutateAsync({ taskId: initialData._id, payload });
    } else {
      await createTaskMutation.mutateAsync(payload);
    }

    onClose();
  };

  const isPending = createTaskMutation.isPending || updateTaskMutation.isPending;
  const errorMsg =
    (createTaskMutation.error as Error)?.message || (updateTaskMutation.error as Error)?.message;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {isEditing ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Task title..."
              {...register("title", { required: "Title is required" })}
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Task details and instructions..."
              {...register("description")}
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                {...register("priority")}
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Due Date & Time
              </label>
              <input
                type="datetime-local"
                {...register("dueAt")}
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <LinkedRecordSelector
            value={linkedRecords}
            onChange={(records) => setValue("linkedRecords", records)}
          />

          <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Saving..." : isEditing ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
