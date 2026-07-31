"use client";

import { useRouter } from "next/navigation";

import { clearAccessToken } from "../../lib/auth";
import { apiClient } from "../../lib/api/client";
import { Button } from "../ui/button";

export const Topbar = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      clearAccessToken();
      router.replace("/login");
    }
  };

  return (
    <header className="flex items-center justify-between rounded-[2rem] border border-white/50 bg-white/70 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-sm font-medium text-foreground">WhatsApp Business Cloud API</p>
        <p className="text-sm text-muted-foreground">
          Single-account operator console for sending, receiving, and monitoring.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-[#16302b] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f8f1de]">
          V0
        </div>
        <Button onClick={handleLogout} size="sm" variant="secondary">
          Logout
        </Button>
      </div>
    </header>
  );
};
