import { ReactNode } from "react";
import { AdminGuard } from "../../admin/components/admin-guard";
import { AdminLayout } from "../../admin/components/admin-layout";

export default function RootAdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}
