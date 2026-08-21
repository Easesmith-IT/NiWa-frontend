import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { useCampaign, useCreateCampaign, useDeleteCampaign, useUpdateCampaignDraft } from "../campaign.queries";
import { useContactsV1Query } from "../../contacts/contact.queries";
import type { ContactRecordV1 } from "../../contacts/contact.types";
import type { ContactItem } from "../components/Step3Audience";
import type { CreateCampaignPayload } from "../campaign.types";

export interface UseCampaignDraftLifecycleParams {
  paramDraftId: string;
  draftId: string | null;
  setDraftId: (id: string | null) => void;
  isSavingDraft: boolean;
  setIsSavingDraft: (val: boolean) => void;
  setLastSavedTime: (time: string | null) => void;
  name: string;
  setName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  connectionId: string;
  setConnectionId: (val: string) => void;
  templateId: string;
  setTemplateId: (val: string) => void;
  audienceType: "import" | "select" | "tags";
  setAudienceType: (type: "import" | "select" | "tags") => void;
  importId: string;
  setImportId: (val: string) => void;
  selectedContactMap: Record<string, ContactItem>;
  setSelectedContactMap: React.Dispatch<React.SetStateAction<Record<string, ContactItem>>>;
  tagsInput: string;
  setTagsInput: (val: string) => void;
  variableValues: Record<string, string>;
  setVariableValues: (vals: Record<string, string>) => void;
  scheduleType: "now" | "scheduled";
  setScheduleType: (type: "now" | "scheduled") => void;
  scheduledAt: string;
  setScheduledAt: (val: string) => void;
  timezone: string;
  setTimezone: (val: string) => void;
  setLaunchError: (err: string) => void;
}

export function useCampaignDraftLifecycle(params: UseCampaignDraftLifecycleParams) {
  const router = useRouter();
  const createMutation = useCreateCampaign();
  const updateDraftMutation = useUpdateCampaignDraft();
  const deleteMutation = useDeleteCampaign();

  const campaignQuery = useCampaign(params.paramDraftId);
  const contactsQuery = useContactsV1Query();
  const hydratedDraftRef = useRef<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Hydrate draft from URL if ?draft=xxx is present using V1 React Query
  useEffect(() => {
    if (!params.paramDraftId) {
      hydratedDraftRef.current = null;
      return;
    }

    params.setDraftId(params.paramDraftId);

    // Guard against repeated hydration once draft is fully loaded
    if (hydratedDraftRef.current === params.paramDraftId) return;

    // Wait until campaign data is loaded
    if (!campaignQuery.data?.campaign) return;

    const c = campaignQuery.data.campaign;
    const hasContactIds = Boolean(c.audience?.contactIds && c.audience.contactIds.length > 0);

    // If draft requires contact details, wait until contactsQuery resolves
    if (hasContactIds && (contactsQuery.isLoading || !contactsQuery.data)) {
      return;
    }

    if (c.name) params.setName(c.name);
    if (c.description) params.setDescription(c.description);
    if (c.connectionId && c.connectionId !== "pending") params.setConnectionId(c.connectionId);
    if (c.templateId && c.templateId !== "pending") params.setTemplateId(c.templateId);

    if (c.audience) {
      if (c.audience.importId) {
        params.setAudienceType("import");
        params.setImportId(c.audience.importId);
      } else if (hasContactIds && c.audience.contactIds) {
        params.setAudienceType("select");
        const contacts = contactsQuery.data?.data || [];
        const map: Record<string, ContactItem> = {};
        c.audience.contactIds.forEach((id) => {
          const found = contacts.find((item: ContactRecordV1) => item._id === id);
          if (found) {
            map[id] = {
              _id: found._id,
              displayName: found.displayName,
              phoneNumber: found.phoneNumber,
              phoneNumberE164: found.phoneNumberE164,
              email: found.email,
              company: found.company,
              customFields: found.customFields,
            };
          } else {
            // Fallback for deleted or missing contacts
            map[id] = { _id: id, displayName: "Contact", phoneNumberE164: id };
          }
        });
        params.setSelectedContactMap(map);
      } else if (c.audience.tags && c.audience.tags.length > 0) {
        params.setAudienceType("tags");
        params.setTagsInput(c.audience.tags.join(", "));
      }
    }

    if (c.variables) params.setVariableValues(c.variables);
    if (c.schedule) {
      params.setScheduleType(c.schedule.type || "now");
      if (c.schedule.scheduledAt) params.setScheduledAt(c.schedule.scheduledAt);
      if (c.schedule.timezone) params.setTimezone(c.schedule.timezone);
    }

    hydratedDraftRef.current = params.paramDraftId;
  }, [
    params.paramDraftId,
    campaignQuery.data,
    contactsQuery.isLoading,
    contactsQuery.data,
    params.setDraftId,
    params.setName,
    params.setDescription,
    params.setConnectionId,
    params.setTemplateId,
    params.setAudienceType,
    params.setImportId,
    params.setSelectedContactMap,
    params.setTagsInput,
    params.setVariableValues,
    params.setScheduleType,
    params.setScheduledAt,
    params.setTimezone,
  ]);

  // Explicit Save Draft Handler
  const handleSaveDraft = async () => {
    if (!params.name.trim()) {
      params.setLaunchError("Please enter at least a Campaign Name in Step 1 before saving a draft.");
      return;
    }
    if (params.isSavingDraft) return;
    params.setIsSavingDraft(true);
    params.setLaunchError("");

    const payload: CreateCampaignPayload = {
      name: params.name.trim() || "Untitled Draft",
      description: params.description.trim(),
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
          : {
              type: "scheduled" as const,
              scheduledAt: params.scheduledAt ? new Date(params.scheduledAt).toISOString() : new Date().toISOString(),
              timezone: params.timezone,
            },
      variables: params.variableValues,
    };

    try {
      if (!params.draftId) {
        const result = await createMutation.mutateAsync(payload);
        params.setDraftId(result.campaign._id);
        router.replace(`/campaigns/new?draft=${result.campaign._id}`);
      } else {
        await updateDraftMutation.mutateAsync({ id: params.draftId, payload });
      }

      const now = new Date();
      params.setLastSavedTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err: unknown) {
      console.error("Failed to save draft:", err);
      const msg = (isAxiosError(err) ? err.response?.data?.message : undefined) || (err as Error).message || "Failed to save draft";
      params.setLaunchError(msg);
    } finally {
      params.setIsSavingDraft(false);
    }
  };

  // Delete Draft Handler (invoked by ConfirmDialog)
  const handleDeleteDraftConfirm = async () => {
    if (!params.draftId) return;
    try {
      await deleteMutation.mutateAsync(params.draftId);
      setShowDeleteConfirm(false);
      router.push("/campaigns");
    } catch (err: unknown) {
      const msg = (isAxiosError(err) ? err.response?.data?.message : undefined) || (err as Error).message || "Failed to delete draft";
      params.setLaunchError(msg);
      setShowDeleteConfirm(false);
    }
  };

  return {
    handleSaveDraft,
    handleDeleteDraftConfirm,
    showDeleteConfirm,
    setShowDeleteConfirm,
  };
}
