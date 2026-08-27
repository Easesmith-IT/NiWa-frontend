import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | NiWa",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Platform overview and metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards for dashboard */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Tenants</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">0</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Users</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">0</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Messages</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">0</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">System Status</div>
          <div className="mt-2 text-3xl font-semibold text-green-600 dark:text-green-500">Healthy</div>
        </div>
      </div>
      
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 min-h-[300px] flex items-center justify-center">
        <p className="text-sm text-slate-500">More platform metrics require backend integration.</p>
      </div>
    </div>
  );
}
