"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  MessageSquare,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { login } from "../../../features/auth";
import { setAccessToken } from "../../../lib/auth";
import { isValidWorkspaceId, setActiveWorkspaceId } from "../../../lib/workspace/workspace-state";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@niwa.local",
      password: "ChangeMe123!",
    },
  });

  const handleFillDemo = () => {
    setValue("email", "admin@niwa.local", { shouldValidate: true });
    setValue("password", "ChangeMe123!", { shouldValidate: true });
    setSubmitError(null);
  };

  const onSubmit = async (values: LoginValues) => {
    try {
      setSubmitError(null);
      const data = await login(values);
      const token = data.accessToken ?? data.token ?? "";
      setAccessToken(token);

      const serverWorkspaceId = data.activeWorkspaceId || data.activeMembership?.workspaceId;
      if (serverWorkspaceId && isValidWorkspaceId(serverWorkspaceId)) {
        setActiveWorkspaceId(serverWorkspaceId);
      }

      const nextParam = new URLSearchParams(window.location.search).get("next");
      router.push(nextParam || "/");
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message ?? "Login failed. Check your credentials."
          : "Login failed. Check your credentials.";
      setSubmitError(message);
    }
  };

  return (
    <main className="flex min-h-screen w-full bg-[#F7F8FA] dark:bg-[#0C0D0E]">
      <div className="grid w-full grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* Left Hero Panel (Desktop) */}
        <div className="relative hidden lg:col-span-6 lg:flex flex-col justify-between border-r border-[#E4E4E7] bg-[#176B4D] p-10 text-white shadow-subtle dark:border-[#292C2F] dark:bg-[#114E38]">
          {/* Top Brand Bar */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 p-2 border border-white/20">
              <Image
                alt="NiWa logo"
                className="h-auto w-full object-contain"
                height={32}
                priority
                src="/niwa-logo.png"
                width={120}
              />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">NiWa Console v2.0</span>
              <p className="text-[11px] text-[#A3E2C9]">Meta WhatsApp Cloud Platform</p>
            </div>
          </div>

          {/* Center Showcase Content */}
          <div className="relative z-10 my-auto max-w-lg space-y-6 py-8">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
                <Zap className="h-3 w-3 fill-white" /> Enterprise Operator Console
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                WhatsApp Business Cloud Operating System
              </h1>
              <p className="text-xs leading-relaxed text-[#D2F2E5]">
                Inbox, CRM, Template Studio, Automation Engine, and Meta API Telemetry.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 rounded-md border border-white/15 bg-white/10 p-3">
                <MessageSquare className="h-4 w-4 mt-0.5 text-white shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Real-Time Ingestion & History Sync</h4>
                  <p className="text-[11px] text-[#D2F2E5] mt-0.5">
                    Instant Meta webhook handling with full thread reconciliation and status tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md border border-white/15 bg-white/10 p-3">
                <ShieldCheck className="h-4 w-4 mt-0.5 text-white shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Meta Cloud API Compliance</h4>
                  <p className="text-[11px] text-[#D2F2E5] mt-0.5">
                    Official Meta Cloud API endpoints, token rotation, and 24h customer window tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md border border-white/15 bg-white/10 p-3">
                <Bot className="h-4 w-4 mt-0.5 text-white shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Customer CRM & Automation Desk</h4>
                  <p className="text-[11px] text-[#D2F2E5] mt-0.5">
                    CSV/JSON bulk import, duplicate detection, label tagging, and rule engine.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/20 pt-4 text-xs text-[#D2F2E5]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              <span>Production Operator Console</span>
            </div>
            <span className="font-mono text-[10px]">v2.0.0</span>
          </div>
        </div>

        {/* Right Operator Login Form Panel */}
        <div className="flex lg:col-span-6 items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-5">
            {/* Header */}
            <div className="text-center space-y-1.5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#EDF8F3] text-[#176B4D] border border-[#C4E8DA] dark:border-[#1F4D3C] dark:bg-[#13251E] dark:text-[#359B76]">
                <KeyRound className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Operator Sign In
              </h2>
              <p className="text-xs text-muted-foreground">
                Sign in to manage your connected WhatsApp Business workspace
              </p>
            </div>

            {/* API Status Pill */}
            <div className="flex items-center justify-center gap-2 rounded-md border border-[#E4E4E7] bg-white py-1.5 px-3 text-xs font-medium text-foreground shadow-subtle dark:border-[#292C2F] dark:bg-[#121416]">
              <span className="h-2 w-2 rounded-full bg-[#176B4D] animate-pulse dark:bg-[#359B76]" />
              <span>Meta Cloud API Connected & Operational</span>
            </div>

            {/* Form Card */}
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-6 shadow-subtle space-y-4 dark:border-[#292C2F] dark:bg-[#121416]">
              {submitError ? (
                <div className="rounded-md border border-[#FEE2E2] bg-[#FEF2F2] p-3 text-xs font-medium text-[#C2413A] dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-[#D7685C]">
                  {submitError}
                </div>
              ) : null}

              <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)}>
                {/* Email Field */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9 text-xs"
                      id="email"
                      placeholder="operator@niwa.local"
                      type="email"
                      {...register("email")}
                    />
                  </div>
                  {errors.email ? (
                    <p className="text-xs text-[#C2413A] dark:text-[#D7685C]">{errors.email.message}</p>
                  ) : null}
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground" htmlFor="password">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9 pr-9 text-xs"
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                    />
                    <button
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((prev) => !prev)}
                      type="button"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="text-xs text-[#C2413A] dark:text-[#D7685C]">{errors.password.message}</p>
                  ) : null}
                </div>

                {/* Submit Button */}
                <Button
                  className="w-full mt-2"
                  disabled={isSubmitting}
                  size="md"
                  type="submit"
                  variant="primary"
                >
                  {isSubmitting ? (
                    <span>Signing in...</span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      Sign in to Console
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Demo Helper Button */}
              <div className="border-t border-[#F0F0F2] pt-3 text-center dark:border-[#202326]">
                <button
                  className="text-xs font-medium text-[#176B4D] hover:underline dark:text-[#359B76]"
                  onClick={handleFillDemo}
                  type="button"
                >
                  Fill default operator demo credentials
                </button>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="text-center text-xs text-muted-foreground">
              <p>
                Data deletion instructions available at{" "}
                <Link
                  className="font-medium text-[#176B4D] underline-offset-4 hover:underline dark:text-[#359B76]"
                  href="/data-deletion-instructions"
                >
                  /data-deletion-instructions
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
