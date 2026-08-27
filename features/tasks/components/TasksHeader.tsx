import React from "react";

export interface TasksHeaderProps {
  totalTasks: number;
  overdueTasks: number;
}

export const TasksHeader: React.FC<TasksHeaderProps> = ({
  totalTasks,
  overdueTasks,
}) => {
  return (
    <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#292C2F] dark:bg-[#121416]">
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
          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#292C2F] dark:bg-[#17191B]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Visible</p>
            <p className="mt-1 text-xl font-bold text-foreground">{totalTasks}</p>
          </div>
          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#292C2F] dark:bg-[#17191B]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Overdue</p>
            <p className="mt-1 text-xl font-bold text-[#C2413A] dark:text-[#D7685C]">{overdueTasks}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
