"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isAxiosError } from "axios";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";

import { Button } from "../../../components/ui/button";
import {
  useCampaign,
  useCreateCampaign,
  useDeleteCampaign,
  useUpdateCampaignDraft,
  useValidateCampaign,
} from "../campaign.queries";
import type { CreateCampaignPayload } from "../campaign.types";
import { useCampaignWizardState } from "../hooks/useCampaignWizardState";
import { CampaignWizardStepper } from "../components/CampaignWizardStepper";
import { Step1CampaignDetails } from "../components/Step1CampaignDetails";
import { Step2WhatsAppTemplate } from "../components/Step2WhatsAppTemplate";
import { Step3Audience, ContactItem } from "../components/Step3Audience";
import { Step4MessageVariables } from "../components/Step4MessageVariables";
import { Step5Schedule } from "../components/Step5Schedule";
import { Step6ReviewLaunch } from "../components/Step6ReviewLaunch";
import { useWhatsAppConnections } from "../../whatsapp-connections/whatsapp-connections.queries";
import { useContactImportsV1Query, useContactsV1Query } from "../../contacts/contact.queries";
import type { ContactRecordV1, ContactImportRecordV1 } from "../../contacts/contact.types";
import type { WhatsAppConnectionRecord } from "../../../lib/api/types";

export function CampaignCreateScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createMutation = useCreateCampaign();
  const updateDraftMutation = useUpdateCampaignDraft();
  const validateMutation = useValidateCampaign();
  const deleteMutation = useDeleteCampaign();

  const paramDraftId = searchParams.get("draft") || "";
  const campaignQuery = useCampaign(paramDraftId);
  const contactsQuery = useContactsV1Query();
  const hydratedDraftRef = useRef<string | null>(null);

  const {
    currentStep,
    setCurrentStep,
    maxReachedStep,
    draftId,
    setDraftId,
    isSavingDraft,
    setIsSavingDraft,
    lastSavedTime,
    setLastSavedTime,
    name,
    setName,
    description,
    setDescription,
    connectionId,
    setConnectionId,
    templateId,
    setTemplateId,
    selectedTemplateObj,
    setSelectedTemplateObj,
    audienceType,
    setAudienceType,
    importId,
    setImportId,
    selectedContactMap,
    setSelectedContactMap,
    tagsInput,
    setTagsInput,
    variableValues,
    setVariableValues,
    scheduleType,
    setScheduleType,
    scheduledAt,
    setScheduledAt,
    timezone,
    setTimezone,
    isSubmitting,
    setIsSubmitting,
    launchError,
    setLaunchError,
    handleNext,
    handleBack,
  } = useCampaignWizardState();

  // Hydrate draft from URL if ?draft=xxx is present using V1 React Query
  useEffect(() => {
    if (!paramDraftId) {
      hydratedDraftRef.current = null;
      return;
    }

    setDraftId(paramDraftId);

    // Guard against repeated hydration once draft is fully loaded
    if (hydratedDraftRef.current === paramDraftId) return;

    // Wait until campaign data is loaded
    if (!campaignQuery.data?.campaign) return;

    const c = campaignQuery.data.campaign;
    const hasContactIds = Boolean(c.audience?.contactIds && c.audience.contactIds.length > 0);

    // If draft requires contact details, wait until contactsQuery resolves
    if (hasContactIds && (contactsQuery.isLoading || !contactsQuery.data)) {
      return;
    }

    if (c.name) setName(c.name);
    if (c.description) setDescription(c.description);
    if (c.connectionId && c.connectionId !== "pending") setConnectionId(c.connectionId);
    if (c.templateId && c.templateId !== "pending") setTemplateId(c.templateId);

    if (c.audience) {
      if (c.audience.importId) {
        setAudienceType("import");
        setImportId(c.audience.importId);
      } else if (hasContactIds && c.audience.contactIds) {
        setAudienceType("select");
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
        setSelectedContactMap(map);
      } else if (c.audience.tags && c.audience.tags.length > 0) {
        setAudienceType("tags");
        setTagsInput(c.audience.tags.join(", "));
      }
    }

    if (c.variables) setVariableValues(c.variables);
    if (c.schedule) {
      setScheduleType(c.schedule.type || "now");
      if (c.schedule.scheduledAt) setScheduledAt(c.schedule.scheduledAt);
      if (c.schedule.timezone) setTimezone(c.schedule.timezone);
    }

    hydratedDraftRef.current = paramDraftId;
  }, [
    paramDraftId,
    campaignQuery.data,
    contactsQuery.isLoading,
    contactsQuery.data,
    setDraftId,
    setName,
    setDescription,
    setConnectionId,
    setTemplateId,
    setAudienceType,
    setImportId,
    setSelectedContactMap,
    setTagsInput,
    setVariableValues,
    setScheduleType,
    setScheduledAt,
    setTimezone,
  ]);

  // Queries for helper details on review step
  const { data: connectionsData } = useWhatsAppConnections();
  const connections = connectionsData?.connections || [];
  const selectedConnectionRecord = connections.find((c: WhatsAppConnectionRecord) => c.id === connectionId) || null;
  const connectionDetails = selectedConnectionRecord
    ? {
        phone: selectedConnectionRecord.displayPhoneNumber || selectedConnectionRecord.phoneNumberId,
        name: selectedConnectionRecord.verifiedName || selectedConnectionRecord.displayName || "WhatsApp Account",
        status: selectedConnectionRecord.connectionStatus,
      }
    : null;

  const importsQuery = useContactImportsV1Query();
  const importsList = importsQuery.data?.data || [];
  const selectedImportObj = importsList.find((i: ContactImportRecordV1) => i.id === importId);
  const importDetails = selectedImportObj
    ? {
        name: selectedImportObj.fileName,
        total: selectedImportObj.stats?.totalRows || 0,
        valid: selectedImportObj.stats?.validRows || selectedImportObj.stats?.totalRows || 0,
        invalid: selectedImportObj.stats?.invalidRows || 0,
      }
    : null;

  // Explicit Save Draft Handler
  const handleSaveDraft = async () => {
    if (!name.trim()) {
      setLaunchError("Please enter at least a Campaign Name in Step 1 before saving a draft.");
      return;
    }
    if (isSavingDraft) return;
    setIsSavingDraft(true);
    setLaunchError("");

    const payload: CreateCampaignPayload = {
      name: name.trim() || "Untitled Draft",
      description: description.trim(),
      connectionId: connectionId || "pending",
      templateId: templateId || "pending",
      audience:
        audienceType === "import"
          ? { importId }
          : audienceType === "select"
          ? { contactIds: Object.keys(selectedContactMap) }
          : { tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean) },
      schedule:
        scheduleType === "now"
          ? { type: "now" as const, timezone }
          : { type: "scheduled" as const, scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString(), timezone },
      variables: variableValues,
    };

    try {
      if (!draftId) {
        const result = await createMutation.mutateAsync(payload);
        setDraftId(result.campaign._id);
        router.replace(`/campaigns/new?draft=${result.campaign._id}`);
      } else {
        await updateDraftMutation.mutateAsync({ id: draftId, payload });
      }

      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err: unknown) {
      console.error("Failed to save draft:", err);
      setLaunchError((isAxiosError(err) ? err.response?.data?.message : undefined) || (err as Error).message || "Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!draftId) return;
    if (window.confirm("Are you sure you want to delete this draft campaign?")) {
      try {
        await deleteMutation.mutateAsync(draftId);
        router.push("/campaigns");
      } catch (err: unknown) {
        alert((isAxiosError(err) ? err.response?.data?.message : undefined) || (err as Error).message || "Failed to delete draft");
      }
    }
  };

  // Launch Campaign Handler
  const handleLaunch = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLaunchError("");

    try {
      let campaignIdToLaunch = draftId;

      const payload: CreateCampaignPayload = {
        name: name.trim() || "Untitled Campaign",
        description,
        connectionId,
        templateId,
        audience:
          audienceType === "import"
            ? { importId }
            : audienceType === "select"
            ? { contactIds: Object.keys(selectedContactMap) }
            : { tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean) },
        schedule:
          scheduleType === "now"
            ? { type: "now" as const, timezone }
            : { type: "scheduled" as const, scheduledAt: new Date(scheduledAt).toISOString(), timezone },
        variables: variableValues,
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
      setLaunchError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-auto bg-gray-50/40">
      {/* Top Header Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/campaigns")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-base font-semibold text-gray-900 leading-none">New Campaign Wizard</h1>
            <p className="mt-0.5 text-[11px] text-gray-400">Create & schedule WhatsApp bulk campaigns</p>
          </div>
        </div>

        {/* Global Save / Delete Draft Action */}
        <div className="flex items-center gap-3">
          {lastSavedTime && (
            <span className="hidden sm:inline-block text-xs text-emerald-700 font-medium">
              Draft saved at {lastSavedTime}
            </span>
          )}
          {draftId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDeleteDraft}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete Draft
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className="border-gray-300 hover:bg-slate-50"
          >
            {isSavingDraft ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin text-emerald-600" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-3.5 w-3.5 text-gray-600" />
                Save Draft
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Stepper Header Bar */}
      <CampaignWizardStepper
        currentStep={currentStep}
        maxReachedStep={maxReachedStep}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {/* Main Wizard Content Area */}
      <div className="flex-1 p-4 lg:p-8">
        <div className="mx-auto max-w-4xl rounded-2xl border bg-white p-6 shadow-sm">
          {launchError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800">
              {launchError}
            </div>
          )}

          {currentStep === 1 && (
            <Step1CampaignDetails
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && (
            <Step2WhatsAppTemplate
              connectionId={connectionId}
              setConnectionId={setConnectionId}
              templateId={templateId}
              setTemplateId={setTemplateId}
              setSelectedTemplateObj={setSelectedTemplateObj}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <Step3Audience
              audienceType={audienceType}
              setAudienceType={setAudienceType}
              importId={importId}
              setImportId={setImportId}
              selectedContactMap={selectedContactMap}
              setSelectedContactMap={setSelectedContactMap}
              tagsInput={tagsInput}
              setTagsInput={setTagsInput}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && (
            <Step4MessageVariables
              template={selectedTemplateObj}
              variableValues={variableValues}
              setVariableValues={setVariableValues}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 5 && (
            <Step5Schedule
              scheduleType={scheduleType}
              setScheduleType={setScheduleType}
              scheduledAt={scheduledAt}
              setScheduledAt={setScheduledAt}
              timezone={timezone}
              setTimezone={setTimezone}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 6 && (
            <Step6ReviewLaunch
              name={name}
              description={description}
              connectionId={connectionId}
              connectionDetails={connectionDetails}
              template={selectedTemplateObj}
              audienceType={audienceType}
              importDetails={importDetails}
              selectedContactCount={Object.keys(selectedContactMap).length}
              selectedContactList={Object.values(selectedContactMap)}
              tagsInput={tagsInput}
              variableValues={variableValues}
              scheduleType={scheduleType}
              scheduledAt={scheduledAt}
              timezone={timezone}
              isSubmitting={isSubmitting}
              isSavingDraft={isSavingDraft}
              lastSavedTime={lastSavedTime}
              onSaveDraft={handleSaveDraft}
              onLaunch={handleLaunch}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}
