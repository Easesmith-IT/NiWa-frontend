import React from "react";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { buildTemplateOptionValue, findTemplateByOptionValue } from "../../../lib/templates";
import { ConversationsReplyComposerProps } from "../conversations.types";

export const ConversationsReplyComposer: React.FC<ConversationsReplyComposerProps> = ({
  selectedConversationId,
  activeTemplates,
  isSending,
  replyError,
  readError,
  replyForm,
  selectedReplyType,
  selectedTemplateName,
  selectedTemplateLanguage,
  onSubmit,
}) => {
  return (
    <div className="border-t border-[#E4E4E7] bg-white p-3.5">
      <form
        className="space-y-3"
        onSubmit={replyForm.handleSubmit(onSubmit)}
      >
        <div className="flex gap-1.5">
          <button
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              selectedReplyType === "text"
                ? "bg-[#176B4D] text-white"
                : "border border-[#E4E4E7] bg-[#FAFAFA] text-foreground"
            }`}
            onClick={() => replyForm.reset({ type: "text", body: "" })}
            type="button"
          >
            Text
          </button>
          <button
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              selectedReplyType === "template"
                ? "bg-[#176B4D] text-white"
                : "border border-[#E4E4E7] bg-[#FAFAFA] text-foreground"
            }`}
            onClick={() =>
              replyForm.reset({
                type: "template",
                templateName: "",
                languageCode: "",
                bodyVariables: "",
              })
            }
            type="button"
          >
            Template
          </button>
        </div>

        {selectedReplyType === "text" ? (
          <Textarea
            className="min-h-20 bg-[#FAFAFA] text-xs"
            placeholder="Type a message reply..."
            {...replyForm.register("body")}
          />
        ) : (
          <div className="space-y-2">
            <select
              className="h-8.5 w-full rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary"
              onChange={(event) => {
                const nextValue = event.target.value;
                const nextTemplate = findTemplateByOptionValue(activeTemplates, nextValue);

                replyForm.setValue("templateName", nextTemplate?.name ?? "");
                replyForm.setValue("languageCode", nextTemplate?.language ?? "");
              }}
              value={
                selectedTemplateName && selectedTemplateLanguage
                  ? `${selectedTemplateName}::${selectedTemplateLanguage}`
                  : ""
              }
            >
              <option value="">Select active template</option>
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
        )}

        {replyError ? <p className="text-xs text-[#C2413A]">{replyError}</p> : null}
        {readError ? <p className="text-xs text-[#C2413A]">{readError}</p> : null}

        <div className="flex justify-end">
          <Button disabled={!selectedConversationId || isSending} type="submit" variant="primary">
            {isSending ? "Sending..." : "Send Reply"}
          </Button>
        </div>
      </form>
    </div>
  );
};
