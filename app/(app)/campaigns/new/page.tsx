"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "../../../../components/ui/button";
import { useCreateCampaign } from "../../../../features/campaigns";
import { CampaignWizardStepper } from "../../../../features/campaigns/components/CampaignWizardStepper";
import { Step1CampaignDetails } from "../../../../features/campaigns/components/Step1CampaignDetails";
import { Step2WhatsAppTemplate } from "../../../../features/campaigns/components/Step2WhatsAppTemplate";
import { Step3Audience, ContactImportItem } from "../../../../features/campaigns/components/Step3Audience";
import { Step4MessageVariables } from "../../../../features/campaigns/components/Step4MessageVariables";
import { Step5Schedule } from "../../../../features/campaigns/components/Step5Schedule";
import { Step6ReviewLaunch } from "../../../../features/campaigns/components/Step6ReviewLaunch";
import { MetaTemplate } from "../../../../features/campaigns/components/WhatsAppMessagePreview";
import { apiClient } from "../../../../lib/api/client";
import { WhatsAppConnectionsResponse } from "../../../../lib/api/types";

export default function NewCampaignPage() {
  const router = useRouter();
  const createMutation = useCreateCampaign();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [maxReachedStep, setMaxReachedStep] = useState(1);

  // Step 1: Campaign Details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Step 2: WhatsApp & Template
  const [connectionId, setConnectionId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [selectedTemplateObj, setSelectedTemplateObj] = useState<MetaTemplate | null>(null);

  // Step 3: Audience
  const [audienceType, setAudienceType] = useState<"import" | "tags">("import");
  const [importId, setImportId] = useState("");
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

  // Queries for helper details on review step
  const connectionsQuery = useQuery({
    queryKey: ["whatsapp-connections"],
    queryFn: async () => {
      const { data } = await apiClient.get<WhatsAppConnectionsResponse>("/whatsapp/connections");
      return data;
    },
  });

  const importsQuery = useQuery({
    queryKey: ["contact-imports-list"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: ContactImportItem[] }>("/contact-imports");
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

  const handleLaunch = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLaunchError("");

    try {
      const result = await createMutation.mutateAsync({
        name,
        description,
        connectionId,
        templateId,
        audience:
          audienceType === "import"
            ? { importId }
            : { tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean) },
        schedule:
          scheduleType === "now"
            ? { type: "now", timezone }
            : { type: "scheduled", scheduledAt: new Date(scheduledAt).toISOString(), timezone },
      });

      router.push(`/campaigns/${result.campaign._id}`);
    } catch (err: any) {
      console.error("Failed to create campaign:", err);
      const msg = err.response?.data?.message || err.message || "Failed to create campaign.";
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
              tagsInput={tagsInput}
              variableValues={variableValues}
              scheduleType={scheduleType}
              scheduledAt={scheduledAt}
              timezone={timezone}
              isSubmitting={isSubmitting}
              onLaunch={handleLaunch}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}
