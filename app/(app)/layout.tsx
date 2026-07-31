import { ReactNode } from "react";

import { AuthGuard } from "../../components/auth-guard";
import { Sidebar } from "../../components/layout/sidebar";
import { Topbar } from "../../components/layout/topbar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-4 lg:px-6">
      <div className="mx-auto grid max-w-[1440px] gap-4 lg:grid-cols-[288px_minmax(0,1fr)]">
        <Sidebar />
        <div className="space-y-4">
          <Topbar />
          <AuthGuard>
            <section className="rounded-[2rem] border border-white/50 bg-white/55 p-5 backdrop-blur">
              {children}
            </section>
          </AuthGuard>
        </div>
      </div>
    </main>
  );
}
