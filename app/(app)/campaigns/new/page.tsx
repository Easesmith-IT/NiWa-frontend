"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "../../../../components/ui/button";
import { useCreateCampaign, useValidateCampaign } from "../../../../features/campaigns";
import { CampaignWizardStepper } from "../../../../features/campaigns/components/CampaignWizardStepper";
import { Step1CampaignDetails } from "../../../../features/campaigns/components/Step1CampaignDetails";
import { Step2WhatsAppTemplate } from "../../../../features/campaigns/components/Step2WhatsAppTemplate";
import { Step3Audience, ContactImportItem, ContactItem } from "../../../../features/campaigns/components/Step3Audience";
import { Step4MessageVariables } from "../../../../features/campaigns/components/Step4MessageVariables";
import { Step5Schedule } from "../../../../features/campaigns/components/Step5Schedule";
import { Step6ReviewLaunch } from "../../../../features/campaigns/components/Step6ReviewLaunch";
import { MetaTemplate } from "../../../../features/campaigns/components/WhatsAppMessagePreview";
import { apiClient } from "../../../../lib/api/client";
import { v1ApiClient } from "../../../../lib/api/v1-client";
import { WhatsAppConnectionsResponse } from "../../../../lib/api/types";
import { Campaign } from "../../../../features/campaigns/campaign.types";

export default function NewCampaignPage() {
  const router = useRouter();
  const createMutation = useCreateCampaign();
  const validateMutation = useValidateCampaign();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [maxReachedStep, setMaxReachedStep] = useState(1);

  // Draft state
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Step 1: Campaign Details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Step 2: WhatsApp & Template
  const [connectionId, setConnectionId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [selectedTemplateObj, setSelectedTemplateObj] = useState<MetaTemplate | null>(null);

  // Step 3: Audience
  const [audienceType, setAudienceType] = useState<"import" | "select" | "tags">("import");
  const [importId, setImportId] = useState("");
  const [selectedContactMap, setSelectedContactMap] = useState<Record<string, ContactItem>>({});
  const [tagsInput, setTagsInput] = useState("");

  // Step 4: Message & Variables
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // Step 5: Schedule
  const [scheduleType, setScheduleType] = useState<"now" | "scheduled">("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Step 6: Launch submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [launchError, setLaunchError] = useState("");

  // Hydrate draft from URL if ?draft=xxx is present
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const paramDraftId = urlParams.get("draft");
    if (!paramDraftId) return;

    setDraftId(paramDraftId);
    v1ApiClient
      .get<{ campaign: Campaign }>(`/campaigns/${paramDraftId}`)
      .then(async ({ data }) => {
        const c = data.campaign;
        if (c.name) setName(c.name);
        if (c.description) setDescription(c.description);
        if (c.connectionId && c.connectionId !== "pending") setConnectionId(c.connectionId);
        if (c.templateId && c.templateId !== "pending") setTemplateId(c.templateId);

        if (c.audience) {
          if (c.audience.importId) {
            setAudienceType("import");
            setImportId(c.audience.importId);
          } else if (c.audience.contactIds && c.audience.contactIds.length > 0) {
            setAudienceType("select");
            try {
              const { data: contactsRes } = await v1ApiClient.get<{ data: ContactItem[] }>("/contacts");
              const contacts = contactsRes.data || [];
              const map: Record<string, ContactItem> = {};
              c.audience.contactIds.forEach((id) => {
                const found = contacts.find((item) => item._id === id);
                if (found) map[id] = found;
                else map[id] = { _id: id, displayName: "Contact", phoneNumberE164: id };
              });
              setSelectedContactMap(map);
            } catch (e) {
              const map: Record<string, ContactItem> = {};
              c.audience.contactIds.forEach((id) => {
                map[id] = { _id: id, displayName: "Contact", phoneNumberE164: id };
              });
              setSelectedContactMap(map);
            }
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
      })
      .catch((err) => {
        console.error("Failed to hydrate draft campaign:", err);
      });
  }, []);

  // Queries for helper details on review step
  const connectionsQuery = useQuery({
    queryKey: ["whatsapp-connections"],
    queryFn: async () => {
      const { data } = await v1ApiClient.get<WhatsAppConnectionsResponse>("/whatsapp/connections");
      return data;
    },
  });

  const importsQuery = useQuery({
    queryKey: ["contact-imports-list"],
    queryFn: async () => {
      const { data } = await v1ApiClient.get<{ data: ContactImportItem[] }>("/contact-imports");
      return data;
    },
  });

  const connections = connectionsQuery.data?.connections || [];
  const selectedConnectionRecord = connections.find((c) => c.id === connectionId) || null;
  const connectionDetails = selectedConnectionRecord
    ? {
        phone: selectedConnectionRecord.displayPhoneNumber || selectedConnectionRecord.phoneNumberId,
        name: selectedConnectionRecord.verifiedName || selectedConnectionRecord.displayName || "WhatsApp Account",
        status: selectedConnectionRecord.connectionStatus,
      }
    : null;

  const importsList = importsQuery.data?.data || [];
  const selectedImportObj = importsList.find((i) => i.id === importId);
  const importDetails = selectedImportObj
    ? {
        name: selectedImportObj.fileName,
        total: selectedImportObj.stats?.totalRows || 0,
        valid: selectedImportObj.stats?.validRows || selectedImportObj.stats?.totalRows || 0,
        invalid: selectedImportObj.stats?.invalidRows || 0,
      }
    : null;

  const goToStep = (step: number) => {
    setCurrentStep(step);
    if (step > maxReachedStep) {
      setMaxReachedStep(step);
    }
  };

  const handleNext = () => {
    goToStep(Math.min(6, currentStep + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Explicit Save Draft Handler
  const handleSaveDraft = async () => {
    if (isSavingDraft) return;
    setIsSavingDraft(true);

    const payload = {
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
          ? { type: "now", timezone }
          : { type: "scheduled", scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString(), timezone },
      variables: variableValues,
    };

    try {
      let savedCampaignId = draftId;
      if (draftId) {
        await v1ApiClient.patch(`/campaigns/${draftId}/draft`, payload);
      } else {
        const { data } = await v1ApiClient.post<{ campaign: Campaign }>("/campaigns", payload);
        savedCampaignId = data.campaign._id;
        setDraftId(savedCampaignId);
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", `?draft=${savedCampaignId}`);
        }
      }

      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err: any) {
      console.error("Failed to save draft:", err);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Launch Campaign Handler
  const handleLaunch = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLaunchError("");

    try {
      let campaignIdToLaunch = draftId;

      if (!campaignIdToLaunch) {
        const result = await createMutation.mutateAsync({
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
              ? { type: "now", timezone }
              : { type: "scheduled", scheduledAt: new Date(scheduledAt).toISOString(), timezone },
          variables: variableValues,
        });
        campaignIdToLaunch = result.campaign._id;
      } else {
        await v1ApiClient.patch(`/campaigns/${campaignIdToLaunch}/draft`, {
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
              ? { type: "now", timezone }
              : { type: "scheduled", scheduledAt: new Date(scheduledAt).toISOString(), timezone },
          variables: variableValues,
        });
      }

      // Validate & Materialize Campaign
      await validateMutation.mutateAsync(campaignIdToLaunch);

      // Redirect to Campaign Detail / Monitoring Page
      router.push(`/campaigns/${campaignIdToLaunch}`);
    } catch (err: any) {
      console.error("Failed to launch campaign:", err);
      const msg = err.response?.data?.message || err.message || "Failed to launch campaign.";
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

        {/* Global Save Draft Action */}
        <div className="flex items-center gap-3">
          {lastSavedTime && (
            <span className="hidden sm:inline-block text-xs text-emerald-700 font-medium">
              Draft saved at {lastSavedTime}
            </span>
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
