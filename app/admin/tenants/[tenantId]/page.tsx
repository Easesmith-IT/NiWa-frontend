import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tenant Details | Admin Console",
};

export default async function AdminTenantDetailPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/tenants" className="text-sm text-blue-600 hover:underline dark:text-blue-400 mb-2 inline-block">
          &larr; Back to Tenants
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Tenant: {tenantId}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Detailed view of the tenant.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-8 text-center text-sm text-slate-500">
          Backend API required to fetch tenant details.
        </div>
      </div>
    </div>
  );
}
