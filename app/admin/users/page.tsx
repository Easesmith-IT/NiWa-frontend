import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users | Admin Console",
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Platform Users
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View and manage all users across the platform.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-8 text-center text-sm text-slate-500">
          Backend API required to list and manage platform users.
        </div>
      </div>
    </div>
  );
}
