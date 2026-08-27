import React from "react";
import { Input } from "../../../components/ui/input";
import { getMediaDisplayName } from "../../../lib/media";
import { buildTemplateOptionValue, findTemplateByOptionValue } from "../../../lib/templates";
import { TemplateMessageComposerProps } from "../message-studio.types";
import { TemplateRecord } from "../../../lib/api/types";

const getBodyVariableKeys = (template?: TemplateRecord | null) =>
  template?.bodyVariables?.length ? template.bodyVariables : template?.variables ?? [];

export const TemplateMessageComposer: React.FC<TemplateMessageComposerProps> = ({
  activeTemplates,
  templateName,
  templateLanguage,
  onTemplateSelect,
  selectedTemplate,
  templateBodyVariableValues,
  onBodyVariableChange,
  templateHeaderFormat,
  isUploadingHeaderMedia,
  templateHeaderUploadName,
  onTemplateHeaderUploadNameChange,
  templateHeaderMediaId,
  onTemplateHeaderMediaIdChange,
  filteredTemplateHeaderMedia,
  selectedTemplateHeaderMedia,
  onUploadHeaderMedia,
  templateHeaderUploadMessage,
  templateHeaderUploadError,
}) => {
  return (
    <>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Select Active Template *</label>
        <select
          className="h-8.5 w-full rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#17191B]"
          onChange={(event) => {
            const nextTemplate = findTemplateByOptionValue(activeTemplates, event.target.value);
            onTemplateSelect(nextTemplate?.name ?? "", nextTemplate?.language ?? "");
          }}
          value={templateName ? `${templateName}::${templateLanguage}` : ""}
        >
          <option value="">
            {activeTemplates.length > 0
              ? "Select approved Meta template"
              : "No active templates available"}
          </option>
          {activeTemplates.map((template) => (
            <option
              key={template._id}
              value={buildTemplateOptionValue(template)}
            >
              {template.name} ({template.language})
            </option>
          ))}
        </select>
      </div>

      {selectedTemplate ? (
        <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 text-xs space-y-1.5 dark:border-[#292C2F] dark:bg-[#17191B]">
          <p className="font-semibold text-foreground">{selectedTemplate.name}</p>
          <p className="text-muted-foreground">
            Status: <span className="font-semibold text-[#16803C] dark:text-[#3FA66F]">{selectedTemplate.status}</span> • Lang: {selectedTemplate.language}
          </p>
          {selectedTemplate.bodyText ? (
            <p className="text-foreground">{selectedTemplate.bodyText}</p>
          ) : null}
        </div>
      ) : null}

      {getBodyVariableKeys(selectedTemplate).length > 0 ? (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-foreground">Body Variables</label>
          {getBodyVariableKeys(selectedTemplate).map((variable, index) => (
            <Input
              key={`${variable}-${index}`}
              onChange={(event) => onBodyVariableChange(index, event.target.value)}
              placeholder={`Variable {{${index + 1}}}: ${variable}`}
              value={templateBodyVariableValues[index] ?? ""}
            />
          ))}
        </div>
      ) : null}

      {templateHeaderFormat ? (
        <div className="space-y-2 rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#292C2F] dark:bg-[#17191B]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <label className="block text-xs font-medium text-foreground">
                Header {templateHeaderFormat.toLowerCase()} media
              </label>
              <p className="mt-1 text-[11px] text-muted-foreground">
                This template requires stored {templateHeaderFormat.toLowerCase()} media before send.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center rounded-md bg-[#176B4D] px-2.5 py-1.5 text-[11px] font-medium text-white dark:bg-[#2D8A67]">
              {isUploadingHeaderMedia ? "Uploading..." : `Upload ${templateHeaderFormat.toLowerCase()}`}
              <input
                accept={
                  templateHeaderFormat === "IMAGE"
                    ? "image/*"
                    : templateHeaderFormat === "VIDEO"
                    ? "video/*"
                    : templateHeaderFormat === "DOCUMENT"
                    ? ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,application/*"
                    : undefined
                }
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }
                  onUploadHeaderMedia(templateHeaderUploadName, file);
                  event.currentTarget.value = "";
                }}
                type="file"
              />
            </label>
          </div>

          <Input
            className="text-xs"
            onChange={(event) => onTemplateHeaderUploadNameChange(event.target.value)}
            placeholder="Optional custom name for next header upload"
            value={templateHeaderUploadName}
          />

          <select
            className="h-8.5 w-full rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#17191B]"
            onChange={(event) => onTemplateHeaderMediaIdChange(event.target.value)}
            value={templateHeaderMediaId}
          >
            <option value="">Select stored {templateHeaderFormat.toLowerCase()} media</option>
            {filteredTemplateHeaderMedia.map((media) => (
              <option key={media._id} value={media.metaMediaId}>
                {getMediaDisplayName(media)} ({media.mediaType})
              </option>
            ))}
          </select>

          {selectedTemplateHeaderMedia ? (
            <div className="rounded-md border border-[#E4E4E7] bg-white p-2 text-[11px] text-foreground dark:border-[#282C2F] dark:bg-[#1C1F21]">
              Selected: <span className="font-medium">{getMediaDisplayName(selectedTemplateHeaderMedia)}</span>
            </div>
          ) : null}

          {filteredTemplateHeaderMedia.length === 0 ? (
            <p className="text-[11px] font-medium text-[#C2413A] dark:text-[#D7685C]">
              No stored {templateHeaderFormat.toLowerCase()} media available yet. Upload one here or from Media.
            </p>
          ) : null}

          {templateHeaderUploadMessage ? (
            <p className="text-[11px] font-medium text-[#16803C] dark:text-[#3FA66F]">
              {templateHeaderUploadMessage}
            </p>
          ) : null}

          {templateHeaderUploadError ? (
            <p className="text-[11px] font-medium text-[#C2413A] dark:text-[#D7685C]">
              {templateHeaderUploadError}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
};
