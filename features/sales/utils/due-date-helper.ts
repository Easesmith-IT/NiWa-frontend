/**
 * Pure helper utility for invoice due-date presentation.
 * 
 * Provenance:
 * Adapted from `piratuks/invoice-builder` (`src/renderer/shared/utils/invoiceFunctions.ts:getDaysLeft`).
 * Commit: 6a7a3327343940038e96509cdf0e8b3a64af8fee
 * 
 * Adaptation details:
 * Converted from a raw number return to a structured UI presentation helper
 * with friendly status badges, color tokens, and localized relative labels.
 * Strictly presentation-only: never mutates invoice state or creates DB statuses.
 */

export type DueDateStatus =
  | "OVERDUE"
  | "DUE_TODAY"
  | "DUE_SOON"
  | "NOT_DUE"
  | "SETTLED"
  | "NO_DUE_DATE";

export interface DueDateInfo {
  status: DueDateStatus;
  daysRemaining: number | null;
  label: string;
  badgeColor: {
    bg: string;
    text: string;
    border: string;
  };
}

/**
 * Calculates calendar days difference between a target date and today.
 * Operates purely on year-month-day calendar dates, ignoring time-of-day.
 */
export function getCalendarDaysDiff(targetDate: Date | string): number {
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  if (isNaN(target.getTime())) return 0;

  const targetDateOnly = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const now = new Date();
  const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((targetDateOnly.getTime() - todayDateOnly.getTime()) / msPerDay);
}

/**
 * Derives due date presentation status for an invoice.
 * Respects payment settlement and void states: settled or voided invoices are marked SETTLED.
 */
export function getDueDateStatus(
  dueDate?: string | Date | null,
  paymentStatus?: string,
  invoiceStatus?: string
): DueDateInfo {
  // If invoice is voided or fully paid, due date urgency no longer applies
  if (invoiceStatus === "VOID" || paymentStatus === "PAID") {
    return {
      status: "SETTLED",
      daysRemaining: null,
      label: paymentStatus === "PAID" ? "Paid" : "Void",
      badgeColor: {
        bg: "bg-neutral-100 dark:bg-neutral-800",
        text: "text-neutral-500 dark:text-neutral-400",
        border: "border-neutral-200 dark:border-neutral-700",
      },
    };
  }

  if (!dueDate) {
    return {
      status: "NO_DUE_DATE",
      daysRemaining: null,
      label: "No due date",
      badgeColor: {
        bg: "bg-neutral-100 dark:bg-neutral-800",
        text: "text-neutral-500 dark:text-neutral-400",
        border: "border-neutral-200 dark:border-neutral-700",
      },
    };
  }

  const days = getCalendarDaysDiff(dueDate);

  if (days < 0) {
    const overdueDays = Math.abs(days);
    return {
      status: "OVERDUE",
      daysRemaining: days,
      label: `Overdue by ${overdueDays} ${overdueDays === 1 ? "day" : "days"}`,
      badgeColor: {
        bg: "bg-rose-50 dark:bg-rose-950/40",
        text: "text-rose-700 dark:text-rose-400",
        border: "border-rose-200 dark:border-rose-800",
      },
    };
  }

  if (days === 0) {
    return {
      status: "DUE_TODAY",
      daysRemaining: 0,
      label: "Due today",
      badgeColor: {
        bg: "bg-amber-50 dark:bg-amber-950/40",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-800",
      },
    };
  }

  if (days <= 3) {
    return {
      status: "DUE_SOON",
      daysRemaining: days,
      label: `Due in ${days} ${days === 1 ? "day" : "days"}`,
      badgeColor: {
        bg: "bg-amber-50/70 dark:bg-amber-950/30",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-200/60 dark:border-amber-800/60",
      },
    };
  }

  return {
    status: "NOT_DUE",
    daysRemaining: days,
    label: `Due in ${days} days`,
    badgeColor: {
      bg: "bg-neutral-50 dark:bg-neutral-800/60",
      text: "text-neutral-600 dark:text-neutral-300",
      border: "border-neutral-200 dark:border-neutral-700",
    },
  };
}
