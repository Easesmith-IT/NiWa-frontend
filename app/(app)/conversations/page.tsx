"use client";

import {
  ConversationsChatWindow,
  ConversationsContactProfile,
  ConversationsHeader,
  ConversationsInfoSidebar,
  ConversationsLabelsCard,
  ConversationsMessageList,
  ConversationsNotesCard,
  ConversationsReplyComposer,
  ConversationsShell,
  ConversationsThreadList,
  useConversationsOrchestration,
} from "../../../features/conversations";

export default function ConversationsPage() {
  const orchestration = useConversationsOrchestration();

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
    <ConversationsShell
      chatWindowNode={
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
      }
      headerNode={
        <ConversationsHeader
          totalThreadsCount={conversations.length}
          unreadCount={totalUnreadCount}
        />
      }
      infoSidebarNode={
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
      }
      threadsListNode={
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
      }
    />
  );
}
