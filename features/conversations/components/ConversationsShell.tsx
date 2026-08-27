"use client";

import React from "react";
import type { useConversationsOrchestration } from "../hooks/useConversationsOrchestration";
import type { ConversationsShellProps } from "../conversations.types";
import { ConversationsChatWindow } from "./ConversationsChatWindow";
import { ConversationsContactProfile } from "./ConversationsContactProfile";
import { ConversationsHeader } from "./ConversationsHeader";
import { ConversationsInfoSidebar } from "./ConversationsInfoSidebar";
import { ConversationsLabelsCard } from "./ConversationsLabelsCard";
import { ConversationsMessageList } from "./ConversationsMessageList";
import { ConversationsNotesCard } from "./ConversationsNotesCard";
import { ConversationsReplyComposer } from "./ConversationsReplyComposer";
import { ConversationsThreadList } from "./ConversationsThreadList";

export interface ShellProps extends Partial<ConversationsShellProps> {
  orchestration?: ReturnType<typeof useConversationsOrchestration>;
}

export const ConversationsShell: React.FC<ShellProps> = ({
  orchestration,
  headerNode,
  threadsListNode,
  chatWindowNode,
  infoSidebarNode,
}) => {
  if (orchestration) {
    const {
      filters: { searchQuery, setSearchQuery, filterMode, setFilterMode },
      selection: { selectedConversationId, setSelectedConversationId },
      workspace: {
        draftLabels,
        labelInput,
        setLabelInput,
        noteContent,
        setNoteContent,
        replyError,
        readError,
        workspaceError,
        addDraftLabel,
        removeDraftLabel,
      },
      reply: {
        replyForm,
        selectedReplyType,
        selectedTemplateName,
        selectedTemplateLanguage,
      },
      conversations,
      activeTemplates,
      workspaceConversation,
      conversationMessages,
      sortedNotes,
      isWorkspaceBusy,
      isLoadingConversations,
      isLoadingDetail,
      isSendingReply,
      isClearingUnread,
      isAddingNote,
      handleReplySubmit,
      handleClearUnread,
      handleSaveLabels,
      handleAddNote,
    } = orchestration;

    const totalUnreadCount = conversations.reduce((total, item) => total + item.unreadCount, 0);

    return (
      <div className="space-y-4">
        <ConversationsHeader
          totalThreadsCount={conversations.length}
          unreadCount={totalUnreadCount}
        />

        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
          <ConversationsThreadList
            conversations={conversations}
            filterMode={filterMode}
            isLoading={isLoadingConversations}
            onFilterModeChange={setFilterMode}
            onSearchChange={setSearchQuery}
            onSelectConversation={setSelectedConversationId}
            searchQuery={searchQuery}
            selectedConversationId={selectedConversationId}
          />

          <ConversationsChatWindow
            isClearingUnread={isClearingUnread}
            messageListNode={
              <ConversationsMessageList
                isLoading={isLoadingDetail}
                messages={conversationMessages}
              />
            }
            onClearUnread={handleClearUnread}
            replyComposerNode={
              <ConversationsReplyComposer
                activeTemplates={activeTemplates}
                isSending={isSendingReply}
                onSubmit={handleReplySubmit}
                readError={readError}
                replyError={replyError}
                replyForm={replyForm}
                selectedConversationId={selectedConversationId}
                selectedReplyType={selectedReplyType}
                selectedTemplateLanguage={selectedTemplateLanguage}
                selectedTemplateName={selectedTemplateName}
              />
            }
            selectedConversationId={selectedConversationId}
            workspaceConversation={workspaceConversation}
          />

          <ConversationsInfoSidebar
            contactProfileNode={
              <ConversationsContactProfile conversation={workspaceConversation} />
            }
            labelsCardNode={
              <ConversationsLabelsCard
                disabled={!selectedConversationId}
                draftLabels={draftLabels}
                isBusy={isWorkspaceBusy}
                labelInput={labelInput}
                onAddLabel={addDraftLabel}
                onLabelInputChange={setLabelInput}
                onRemoveLabel={removeDraftLabel}
                onSaveLabels={handleSaveLabels}
                workspaceError={workspaceError}
              />
            }
            notesCardNode={
              <ConversationsNotesCard
                disabled={!selectedConversationId}
                isAddingNote={isAddingNote}
                noteContent={noteContent}
                onAddNote={handleAddNote}
                onNoteContentChange={setNoteContent}
                sortedNotes={sortedNotes}
              />
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {headerNode}

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        {threadsListNode}
        {chatWindowNode}
        {infoSidebarNode}
      </div>
    </div>
  );
};
