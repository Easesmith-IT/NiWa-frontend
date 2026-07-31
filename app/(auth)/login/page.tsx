"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { apiClient } from "../../../lib/api/client";
import { setAccessToken } from "../../../lib/auth";
import { LoginResponse } from "../../../lib/api/types";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@niwa.local",
      password: "ChangeMe123!",
    },
  });

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
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-8">
        <Image
          alt="NiWa logo"
          className="h-auto w-full max-w-[220px]"
          height={72}
          priority
          src="/niwa-logo.png"
          width={300}
        />
        <h1 className="mt-6 text-3xl font-semibold">Operator Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to manage the connected WhatsApp Business account.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email ? <p className="text-sm text-red-600">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password ? (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            ) : null}
          </div>

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
          {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
        </form>

        <div className="mt-8 border-t border-border pt-4 text-center text-sm text-muted-foreground">
          <p>
            Data deletion instructions are available at{" "}
            <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/data-deletion-instructions">
              /data-deletion-instructions
            </Link>
            .
          </p>
        </div>
      </Card>
    </main>
  );
}
