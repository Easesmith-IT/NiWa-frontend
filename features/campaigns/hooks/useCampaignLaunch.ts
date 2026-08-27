import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { useCreateCampaign, useUpdateCampaignDraft, useValidateCampaign } from "../campaign.queries";
import type { CreateCampaignPayload } from "../campaign.types";
import type { ContactItem } from "../components/Step3Audience";

export interface UseCampaignLaunchParams {
  draftId: string | null;
  name: string;
  description: string;
  connectionId: string;
  templateId: string;
  audienceType: "import" | "select" | "tags";
  importId: string;
  selectedContactMap: Record<string, ContactItem>;
  tagsInput: string;
  variableValues: Record<string, string>;
  scheduleType: "now" | "scheduled";
  scheduledAt: string;
  timezone: string;
  isSubmitting: boolean;
  setIsSubmitting: (val: boolean) => void;
  setLaunchError: (err: string) => void;
}

export function useCampaignLaunch(params: UseCampaignLaunchParams) {
  const router = useRouter();
  const createMutation = useCreateCampaign();
  const updateDraftMutation = useUpdateCampaignDraft();
  const validateMutation = useValidateCampaign();

  const handleLaunch = async () => {
    if (params.isSubmitting) return;
    params.setIsSubmitting(true);
    params.setLaunchError("");

    try {
      let campaignIdToLaunch = params.draftId;

      const payload: CreateCampaignPayload = {
        name: params.name.trim() || "Untitled Campaign",
        description: params.description,
        connectionId: params.connectionId || "pending",
        templateId: params.templateId || "pending",
        audience:
          params.audienceType === "import"
            ? { importId: params.importId }
            : params.audienceType === "select"
            ? { contactIds: Object.keys(params.selectedContactMap) }
            : { tags: params.tagsInput.split(",").map((t) => t.trim()).filter(Boolean) },
        schedule:
          params.scheduleType === "now"
            ? { type: "now" as const, timezone: params.timezone }
            : { type: "scheduled" as const, scheduledAt: new Date(params.scheduledAt).toISOString(), timezone: params.timezone },
        variables: params.variableValues,
      };

      if (!campaignIdToLaunch) {
        const result = await createMutation.mutateAsync(payload);
        campaignIdToLaunch = result.campaign._id;
      } else {
        await updateDraftMutation.mutateAsync({ id: campaignIdToLaunch, payload });
      }

      // Validate & Materialize Campaign
      await validateMutation.mutateAsync(campaignIdToLaunch);

      // Redirect to Campaign Detail / Monitoring Page
      router.push(`/campaigns/${campaignIdToLaunch}`);
    } catch (err: unknown) {
      console.error("Failed to launch campaign:", err);
      const msg = (isAxiosError(err) ? err.response?.data?.message : undefined) || (err as Error).message || "Failed to launch campaign.";
      params.setLaunchError(msg);
      params.setIsSubmitting(false);
    }
  };

  return {
    handleLaunch,
  };
}
