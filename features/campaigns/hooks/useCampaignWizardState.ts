import { useState } from "react";
import type { MetaTemplate } from "../components/WhatsAppMessagePreview";
import type { ContactItem } from "../components/Step3Audience";

export function useCampaignWizardState() {
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

  return {
    currentStep,
    setCurrentStep,
    maxReachedStep,
    setMaxReachedStep,
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
    goToStep,
    handleNext,
    handleBack,
  };
}
