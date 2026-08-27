import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { z } from "zod";

import { clearAccessToken, redirectToLogin } from "../../../lib/auth";
import { useChangePasswordMutation } from "../settings.queries";

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Password confirmation does not match.",
    path: ["confirmPassword"],
  });

export type PasswordValues = z.infer<typeof passwordSchema>;

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof AxiosError ? error.response?.data?.message ?? fallback : fallback;

export function useSecuritySettingsState() {
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const passwordMutation = useChangePasswordMutation();

  const handlePasswordSubmit = passwordForm.handleSubmit((values) => {
    setPasswordError(null);
    setPasswordMessage(null);
    passwordMutation.mutate(values, {
      onSuccess: (data) => {
        setPasswordError(null);
        setPasswordMessage(data.message);
        passwordForm.reset();
        clearAccessToken();
        window.setTimeout(() => {
          redirectToLogin();
        }, 1200);
      },
      onError: (error) => {
        setPasswordError(getErrorMessage(error, "Failed to update password."));
        setPasswordMessage(null);
      },
    });
  });

  return {
    passwordForm,
    passwordMutation,
    passwordMessage,
    passwordError,
    handlePasswordSubmit,
  };
}
