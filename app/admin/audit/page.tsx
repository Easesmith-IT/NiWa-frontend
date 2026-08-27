import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Logs | Admin Console",
};

export default function AdminAuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Audit Logs
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          System-wide audit trail.
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        Backend API required to fetch platform audit logs.
      </div>
    </div>
  );
}
