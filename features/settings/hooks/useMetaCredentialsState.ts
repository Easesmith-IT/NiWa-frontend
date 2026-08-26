import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { z } from "zod";

import {
  useSettingsQuery,
  useTestConnectionMutation,
  useUpdateSettingsMutation,
} from "../settings.queries";

export const settingsSchema = z.object({
  appId: z.string(),
  appSecret: z.string(),
  accessToken: z.string(),
  businessAccountId: z.string(),
  phoneNumberId: z.string(),
  verifyToken: z.string(),
  webhookUrl: z.string(),
  apiVersion: z.string(),
  cloudApiBaseUrl: z.string(),
});

export type SettingsValues = z.infer<typeof settingsSchema>;

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof AxiosError ? error.response?.data?.message ?? fallback : fallback;

export function useMetaCredentialsState() {
  const [showStoredSecrets, setShowStoredSecrets] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const settingsForm = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      appId: "",
      appSecret: "",
      accessToken: "",
      businessAccountId: "",
      phoneNumberId: "",
      verifyToken: "",
      webhookUrl: "",
      apiVersion: "v22.0",
      cloudApiBaseUrl: "https://graph.facebook.com",
    },
  });

  const settingsQuery = useSettingsQuery(showStoredSecrets);
  const saveMutation = useUpdateSettingsMutation();
  const connectionTestMutation = useTestConnectionMutation();

  useEffect(() => {
    if (settingsQuery.data) {
      settingsForm.reset(settingsQuery.data.settings);
    }
  }, [settingsForm, settingsQuery.data]);

  const handleSaveSettings = settingsForm.handleSubmit((values) => {
    setSubmitError(null);
    setSubmitMessage(null);
    connectionTestMutation.reset();
    saveMutation.mutate(values, {
      onSuccess: (data) => {
        setSubmitError(null);
        setSubmitMessage("Settings saved.");
        settingsForm.reset(data.settings);
        settingsQuery.refetch();
      },
      onError: (error) => {
        setSubmitError(getErrorMessage(error, "Failed to save settings."));
        setSubmitMessage(null);
      },
    });
  });

  const handleTestConnection = () => {
    setConnectionError(null);
    connectionTestMutation.mutate(undefined, {
      onSuccess: () => {
        setConnectionError(null);
      },
      onError: (error) => {
        setConnectionError(getErrorMessage(error, "Failed to test Meta connection."));
      },
    });
  };

  const toggleShowStoredSecrets = () => {
    setShowStoredSecrets((current) => !current);
  };

  return {
    showStoredSecrets,
    setShowStoredSecrets,
    toggleShowStoredSecrets,
    submitMessage,
    submitError,
    connectionError,
    settingsForm,
    settingsQuery,
    saveMutation,
    connectionTestMutation,
    handleSaveSettings,
    handleTestConnection,
  };
}
