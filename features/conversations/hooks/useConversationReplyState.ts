import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { MediaRecord, TemplateRecord } from "../../../lib/api/types";
import { findTemplateByOptionValue } from "../../../lib/templates";

export const replySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    body: z.string().min(1, "Reply body is required."),
  }),
  z.object({
    type: z.literal("template"),
    templateName: z.string().min(1, "Template is required."),
    languageCode: z.string().min(2, "Language code is required."),
    bodyVariables: z.string().optional(),
  }),
  z.object({
    type: z.enum(["image", "video", "audio", "document", "sticker"]),
    mediaId: z.string().min(1, "Media selection is required."),
    caption: z.string().optional(),
    filename: z.string().optional(),
  }),
]);

export type ReplyValues = z.input<typeof replySchema>;

const getTemplateVariables = (template?: Pick<TemplateRecord, "variables"> | null) =>
  Array.isArray(template?.variables) ? template.variables : [];

export interface UseConversationReplyStateProps {
  activeTemplates: TemplateRecord[];
  allMedia: MediaRecord[];
}

export const useConversationReplyState = ({
  activeTemplates,
  allMedia,
}: UseConversationReplyStateProps) => {
  const replyForm = useForm<ReplyValues>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      type: "text",
      body: "",
    },
  });

  const selectedReplyType = replyForm.watch("type");
  const selectedTemplateName =
    selectedReplyType === "template" ? replyForm.watch("templateName") : undefined;
  const selectedTemplateLanguage =
    selectedReplyType === "template" ? replyForm.watch("languageCode") : undefined;
  const selectedMediaId =
    selectedReplyType !== "text" && selectedReplyType !== "template"
      ? replyForm.watch("mediaId")
      : undefined;

  const selectedTemplate = useMemo(
    () =>
      findTemplateByOptionValue(
        activeTemplates,
        selectedTemplateName && selectedTemplateLanguage
          ? `${selectedTemplateName}::${selectedTemplateLanguage}`
          : "",
      ),
    [activeTemplates, selectedTemplateLanguage, selectedTemplateName],
  );

  const selectedTemplateVariables = useMemo(
    () => getTemplateVariables(selectedTemplate),
    [selectedTemplate],
  );

  const selectedMedia = useMemo(
    () => allMedia.find((item: MediaRecord) => item.metaMediaId === selectedMediaId) ?? null,
    [allMedia, selectedMediaId],
  );

  useEffect(() => {
    if (selectedTemplate) {
      replyForm.setValue("languageCode", selectedTemplate.language || "en");
    }
  }, [replyForm, selectedTemplate]);

  return {
    replyForm,
    selectedReplyType,
    selectedTemplateName,
    selectedTemplateLanguage,
    selectedMediaId,
    selectedTemplate,
    selectedTemplateVariables,
    selectedMedia,
  };
};
