import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tenants | Admin Console",
};

export default function AdminTenantsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Tenants
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage workspaces and accounts across the platform.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
           {/* Placeholder for search/filter */}
           <div className="h-9 w-full max-w-sm rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
        <div className="p-8 text-center text-sm text-slate-500">
          Backend API required to list and manage tenants.
        </div>
      </div>
    </div>
  );
}
