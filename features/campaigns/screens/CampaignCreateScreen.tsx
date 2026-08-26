"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { ConfirmDialog } from "../../../components/shared/ConfirmDialog";
import { useCampaignWizardState } from "../hooks/useCampaignWizardState";
import { useCampaignDraftLifecycle } from "../hooks/useCampaignDraftLifecycle";
import { useCampaignLaunch } from "../hooks/useCampaignLaunch";
import { CampaignWizardStepper } from "../components/CampaignWizardStepper";
import { Step1CampaignDetails } from "../components/Step1CampaignDetails";
import { Step2WhatsAppTemplate } from "../components/Step2WhatsAppTemplate";
import { Step3Audience } from "../components/Step3Audience";
import { Step4MessageVariables } from "../components/Step4MessageVariables";
import { Step5Schedule } from "../components/Step5Schedule";
import { Step6ReviewLaunch } from "../components/Step6ReviewLaunch";
import { useWhatsAppConnections } from "../../whatsapp-connections/whatsapp-connections.queries";
import { useContactImportsV1Query } from "../../contacts/contact.queries";
import type { ContactImportRecord } from "../../contacts/contact.types";
import type { WhatsAppConnectionRecord } from "../../../lib/api/types";

export function CampaignCreateScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramDraftId = searchParams.get("draft") || "";

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

  const {
    handleSaveDraft,
    handleDeleteDraftConfirm,
    showDeleteConfirm,
    setShowDeleteConfirm,
  } = useCampaignDraftLifecycle({
    paramDraftId,
    draftId,
    setDraftId,
    isSavingDraft,
    setIsSavingDraft,
    setLastSavedTime,
    name,
    setName,
    description,
    setDescription,
    connectionId,
    setConnectionId,
    templateId,
    setTemplateId,
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
    setLaunchError,
  });

  const { handleLaunch } = useCampaignLaunch({
    draftId,
    name,
    description,
    connectionId,
    templateId,
    audienceType,
    importId,
    selectedContactMap,
    tagsInput,
    variableValues,
    scheduleType,
    scheduledAt,
    timezone,
    isSubmitting,
    setIsSubmitting,
    setLaunchError,
  });

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
  const selectedImportObj = importsList.find((i: ContactImportRecord) => i.id === importId);
  const importDetails = selectedImportObj
    ? {
        name: selectedImportObj.fileName,
        total: selectedImportObj.stats?.totalRows || 0,
        valid: selectedImportObj.stats?.validRows || selectedImportObj.stats?.totalRows || 0,
        invalid: selectedImportObj.stats?.invalidRows || 0,
      }
    : null;

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
              onClick={() => setShowDeleteConfirm(true)}
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

      {/* Confirm Dialog for Draft Deletion */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Draft Campaign"
        description={`Are you sure you want to delete draft "${name || "Untitled Draft"}"? This action cannot be undone.`}
        confirmLabel="Delete Draft"
        variant="destructive"
        onConfirm={handleDeleteDraftConfirm}
      />

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
