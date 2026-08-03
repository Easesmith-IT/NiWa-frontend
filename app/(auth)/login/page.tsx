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
import { apiClient } from "../../../lib/api/client";
import { setAccessToken } from "../../../lib/auth";
import type { LoginResponse } from "../../../lib/api/types";

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
      const response = await apiClient.post<LoginResponse>("/auth/login", values);
      setAccessToken(response.data.accessToken);
      router.push("/");
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message ?? "Login failed. Check your credentials."
          : "Login failed. Check your credentials.";
      setSubmitError(message);
    }
  };

  return (
    <main className="flex min-h-screen w-full bg-[#fbf7f1]">
      <div className="grid w-full grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* Left Hero Panel (Desktop) */}
        <div className="relative hidden lg:col-span-6 lg:flex flex-col justify-between overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e4535] via-[#16362f] to-[#0a1b15] p-12 text-white shadow-2xl">
          {/* Subtle Ambient Background Light */}
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#2d644d]/30 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-[#3b8266]/20 blur-3xl" />

          {/* Top Brand Bar */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 p-2.5 backdrop-blur-md border border-white/15 shadow-inner">
              <Image
                alt="NiWa logo"
                className="h-auto w-full object-contain"
                height={40}
                priority
                src="/niwa-logo.png"
                width={160}
              />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">NiWa Console</span>
              <p className="text-xs text-[#a0c4b5]">WhatsApp Business Platform</p>
            </div>
          </div>

          {/* Center Showcase Content */}
          <div className="relative z-10 my-auto max-w-lg space-y-8 py-10">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#86dfb6] backdrop-blur-md">
                <Zap className="h-3.5 w-3.5 fill-[#86dfb6]" /> Enterprise Operator Desk
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                Powerful WhatsApp Business Platform for Every Stage
              </h1>
              <p className="text-sm leading-relaxed text-[#c3ded2]">
                Inbox, Customer CRM, Automation, AI Analytics, and Meta Cloud API integration built for scale.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition hover:bg-white/10">
                <div className="rounded-xl bg-[#2d644d] p-2.5 text-white">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Real-Time Ingestion & History Sync</h4>
                  <p className="text-xs text-[#a0c4b5] mt-0.5">
                    Instant Meta webhook handling with full thread reconciliation and status tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition hover:bg-white/10">
                <div className="rounded-xl bg-[#2d644d] p-2.5 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Meta Cloud API Compliance</h4>
                  <p className="text-xs text-[#a0c4b5] mt-0.5">
                    Official Meta Cloud API endpoints, token rotation, and 24h customer window tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition hover:bg-white/10">
                <div className="rounded-xl bg-[#2d644d] p-2.5 text-white">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Customer CRM & Data Table Desk</h4>
                  <p className="text-xs text-[#a0c4b5] mt-0.5">
                    CSV/JSON bulk import, duplicate detection, label tagging, and contact merging.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-[#a0c4b5]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#86dfb6]" />
              <span>Production-grade single account operator desk</span>
            </div>
            <span>v1.0.0</span>
          </div>
        </div>

        {/* Right Operator Login Form Panel */}
        <div className="flex lg:col-span-6 items-center justify-center p-6 sm:p-12 md:p-16">
          <div className="w-full max-w-md space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6eee6] text-[#2d644d] shadow-sm">
                <KeyRound className="h-7 w-7" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-[#25342f]">
                Operator Login
              </h2>
              <p className="text-xs text-[#6f7f75]">
                Sign in to manage your connected WhatsApp Business account
              </p>
            </div>

            {/* API Status Pill */}
            <div className="flex items-center justify-center gap-2 rounded-full border border-[#bfd8c6] bg-[#eef8f0] py-1.5 px-4 text-xs font-medium text-[#244b42]">
              <span className="h-2 w-2 rounded-full bg-[#2d644d] animate-pulse" />
              <span>Meta Cloud API Connected & Operational</span>
            </div>

            {/* Form Card */}
            <div className="rounded-3xl border border-[#e5ddd3] bg-white p-8 shadow-xl space-y-6">
              {submitError ? (
                <div className="rounded-xl border border-[#e6c2bc] bg-[#fdf0ee] p-3.5 text-xs font-medium text-[#9a3d33]">
                  {submitError}
                </div>
              ) : null}

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f7f75]" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#7a8b82]" />
                    <Input
                      className="h-11 rounded-xl border-[#ddd2c3] bg-[#fbf7f1] pl-10 text-xs text-[#25342f] outline-none transition focus:border-[#2d644d] focus:bg-white focus:ring-2 focus:ring-[#2d644d]/20"
                      id="email"
                      placeholder="operator@niwa.local"
                      type="email"
                      {...register("email")}
                    />
                  </div>
                  {errors.email ? (
                    <p className="text-xs text-[#9a3d33]">{errors.email.message}</p>
                  ) : null}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f7f75]" htmlFor="password">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#7a8b82]" />
                    <Input
                      className="h-11 rounded-xl border-[#ddd2c3] bg-[#fbf7f1] pl-10 pr-10 text-xs text-[#25342f] outline-none transition focus:border-[#2d644d] focus:bg-white focus:ring-2 focus:ring-[#2d644d]/20"
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                    />
                    <button
                      className="absolute right-3.5 top-3 text-[#7a8b82] transition hover:text-[#25342f]"
                      onClick={() => setShowPassword((prev) => !prev)}
                      type="button"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="text-xs text-[#9a3d33]">{errors.password.message}</p>
                  ) : null}
                </div>

                {/* Submit Button */}
                <Button
                  className="h-11 w-full rounded-xl bg-[#2d644d] text-sm font-semibold text-white transition hover:bg-[#23503d] shadow-md disabled:opacity-50"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? (
                    <span>Signing in...</span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign in to Console
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Demo Helper Button */}
              <div className="border-t border-[#eee4d8] pt-4 text-center">
                <button
                  className="text-xs font-medium text-[#2d644d] hover:underline"
                  onClick={handleFillDemo}
                  type="button"
                >
                  Fill default operator demo credentials
                </button>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="text-center text-xs text-[#7a8b82]">
              <p>
                Data deletion instructions available at{" "}
                <Link
                  className="font-medium text-[#2d644d] underline-offset-4 hover:underline"
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
