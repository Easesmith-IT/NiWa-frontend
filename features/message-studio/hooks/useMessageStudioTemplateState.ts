import { useState, useEffect, useMemo, SetStateAction, Dispatch } from "react";
import { TemplateRecord } from "../../../lib/api/types";
import { getTemplateUrlButtons } from "../../../lib/message-studio";
import { findTemplateByOptionValue } from "../../../lib/templates";

export interface UseMessageStudioTemplateStateProps {
  initialTemplate: string;
  initialLanguage: string;
  initialMediaId: string;
  activeTemplates: TemplateRecord[];
}

export const useMessageStudioTemplateState = ({
  initialTemplate,
  initialLanguage,
  initialMediaId,
  activeTemplates,
}: UseMessageStudioTemplateStateProps) => {
  const [templateName, setTemplateName] = useState(initialTemplate);
  const [templateLanguage, setTemplateLanguage] = useState(initialLanguage);
  const [templateVariables, setTemplateVariables] = useState("");
  const [templateBodyVariableValues, setTemplateBodyVariableValues] = useState<string[]>([]);
  const [templateHeaderVariableValues, setTemplateHeaderVariableValues] = useState<string[]>([]);
  const [templateHeaderMediaId, setTemplateHeaderMediaId] = useState(initialMediaId);
  const [templateButtonVariables, setTemplateButtonVariables] = useState<string[]>([]);
  const [templateHeaderUploadName, setTemplateHeaderUploadName] = useState("");
  const [templateHeaderUploadMessage, setTemplateHeaderUploadMessage] = useState<string | null>(null);
  const [templateHeaderUploadError, setTemplateHeaderUploadError] = useState<string | null>(null);

  const selectedTemplate = useMemo(
    () =>
      findTemplateByOptionValue(
        activeTemplates,
        templateName && templateLanguage ? `${templateName}::${templateLanguage}` : "",
      ),
    [activeTemplates, templateLanguage, templateName],
  );

  const templateHeaderFormat = useMemo(() => {
    if (
      selectedTemplate?.headerFormat &&
      ["IMAGE", "VIDEO", "DOCUMENT"].includes(selectedTemplate.headerFormat)
    ) {
      return selectedTemplate.headerFormat;
    }

    const headerComponent = selectedTemplate?.components.find(
      (component: NonNullable<TemplateRecord["components"]>[number]) => component.type === "HEADER" && ["IMAGE", "VIDEO", "DOCUMENT"].includes(component.format ?? "")
    );
    return headerComponent?.format;
  }, [selectedTemplate]);

  const templateUrlButtons = useMemo(
    () => getTemplateUrlButtons(selectedTemplate),
    [selectedTemplate],
  );

  const templateHeaderMediaAccept = useMemo(() => {
    if (templateHeaderFormat === "IMAGE") {
      return "image/*";
    }
    if (templateHeaderFormat === "VIDEO") {
      return "video/*";
    }
    if (templateHeaderFormat === "DOCUMENT") {
      return ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,application/*";
    }
    return undefined;
  }, [templateHeaderFormat]);

  useEffect(() => {
    if (selectedTemplate && selectedTemplate.language !== templateLanguage) {
      setTemplateLanguage(selectedTemplate.language);
    }
  }, [selectedTemplate, templateLanguage]);

  useEffect(() => {
    const getBodyVariableKeys = (template?: TemplateRecord | null) =>
      template?.bodyVariables?.length ? template.bodyVariables : template?.variables ?? [];
    
    const bodyKeys = getBodyVariableKeys(selectedTemplate);
    const headerKeys = selectedTemplate?.headerVariables ?? [];

    setTemplateBodyVariableValues((current) =>
      bodyKeys.map((_: string, index: number) => current[index] ?? ""),
    );
    setTemplateHeaderVariableValues((current) =>
      headerKeys.map((_: string, index: number) => current[index] ?? ""),
    );
  }, [selectedTemplate]);

  useEffect(() => {
    setTemplateVariables(templateBodyVariableValues.join("\n"));
  }, [templateBodyVariableValues]);

  useEffect(() => {
    setTemplateHeaderMediaId("");
  }, [selectedTemplate?.name, selectedTemplate?.language]);

  useEffect(() => {
    setTemplateButtonVariables([]);
  }, [selectedTemplate?.name, selectedTemplate?.language]);

  return {
    templateName,
    setTemplateName,
    templateLanguage,
    setTemplateLanguage,
    templateVariables,
    setTemplateVariables,
    templateBodyVariableValues,
    setTemplateBodyVariableValues,
    templateHeaderVariableValues,
    setTemplateHeaderVariableValues,
    templateHeaderMediaId,
    setTemplateHeaderMediaId,
    templateButtonVariables,
    setTemplateButtonVariables,
    templateHeaderUploadName,
    setTemplateHeaderUploadName,
    templateHeaderUploadMessage,
    setTemplateHeaderUploadMessage,
    templateHeaderUploadError,
    setTemplateHeaderUploadError,
    selectedTemplate,
    templateHeaderFormat,
    templateUrlButtons,
    templateHeaderMediaAccept,
  };
};
