import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { z } from "zod";

import { useProfileQuery, useUpdateProfileMutation } from "../settings.queries";

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export type ProfileValues = z.infer<typeof profileSchema>;

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof AxiosError ? error.response?.data?.message ?? fallback : fallback;

export function useOperatorProfileState() {
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
    },
  });

  const profileQuery = useProfileQuery();
  const profileMutation = useUpdateProfileMutation();

  useEffect(() => {
    if (profileQuery.data) {
      profileForm.reset({
        name: profileQuery.data.user.name,
      });
    }
  }, [profileForm, profileQuery.data]);

  const handleProfileSubmit = profileForm.handleSubmit((values) => {
    setProfileError(null);
    setProfileMessage(null);
    profileMutation.mutate(values, {
      onSuccess: (data) => {
        setProfileError(null);
        setProfileMessage("Profile updated.");
        profileForm.reset({
          name: data.user.name,
        });
        profileQuery.refetch();
      },
      onError: (error) => {
        setProfileError(getErrorMessage(error, "Failed to update profile."));
        setProfileMessage(null);
      },
    });
  });

  return {
    profileForm,
    profileQuery,
    profileMutation,
    profileMessage,
    profileError,
    handleProfileSubmit,
  };
}
