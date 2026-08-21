"use client";

import {
  ChatComposer,
  ChatMessageList,
  ImageLightboxModal,
  InboxChatWindow,
  InboxContactSidebar,
  InboxLayout,
  InboxThreadList,
  toIsoFromDateInput,
  useInboxOrchestration,
} from "../../../features/inbox";

export default function InboxPage() {
  const { thread, sidebar, composer } = useInboxOrchestration();

  const {
    filter,
    setFilter,
    search,
    setSearch,
    selectedConversationId,
    setSelectedConversationId,
    threadsQuery,
    threads,
    selectedThread,
    activeConversationId,
    detailQuery,
    detail,
    threadMutation,
    syncHistoryMutation,
    handleSyncHistory,
    olderMessages,
    isLoadingNextBatch,
    hasMoreOlderMessages,
    nextCursor,
    paginationError,
    retryLoadOlder,
    messagesContainerRef,
    messagesEndRef,
    scrollToBottom,
    handleMessageContainerScroll,
    hasInitialScrollCompleted,
    showJumpToBottom,
    newMessageCount,
    setNewMessageCount,
    lightboxImageId,
    setLightboxImageId,
    displayedMessages,
    lightboxImages,
    messageGroups,
  } = thread;

  const {
    contactInfoOpen,
    setContactInfoOpen,
    actionsOpen,
    setActionsOpen,
    editingContact,
    setEditingContact,
    editDisplayName,
    setEditDisplayName,
    editCompany,
    setEditCompany,
    editEmail,
    setEditEmail,
    editAvatarUrl,
    setEditAvatarUrl,
    selectedLabelId,
    setSelectedLabelId,
    taskTitle,
    setTaskTitle,
    taskDueDate,
    setTaskDueDate,
    taskPriority,
    setTaskPriority,
    noteContent,
    setNoteContent,
    notePinned,
    setNotePinned,
    editingNoteId,
    setEditingNoteId,
    editingNoteContent,
    setEditingNoteContent,
    labelsQuery,
    tasksQuery,
    agentsQuery,
    patchContactMutation,
    addLabelMutation,
    removeLabelMutation,
    createTaskMutation,
    completeTaskMutation,
    cancelTaskMutation,
    createNoteMutation,
    patchNoteMutation,
    deleteNoteMutation,
    setNotePinnedMutation,
    updateAIModeMutation,
    transferAgentMutation,
    availableLabels,
    contactLabels,
    tasks,
    agents,
  } = sidebar;

  const {
    composerBody,
    setComposerBody,
    composerMenuOpen,
    setComposerMenuOpen,
    composerFeedback,
    setComposerFeedback,
    selectedQuickReplyId,
    setSelectedQuickReplyId,
    quickReplyVariableValues,
    setQuickReplyVariableValues,
    quickReplyPanelOpen,
    setQuickReplyPanelOpen,
    scheduledDate,
    setScheduledDate,
    scheduledType,
    setScheduledType,
    scheduledRule,
    setScheduledRule,
    scheduleDialogOpen,
    setScheduleDialogOpen,
    sendTextMutation,
    patchQuickReplyMutation,
    createScheduledMessageMutation,
    quickReplies,
    scheduledItems,
    selectedQuickReply,
    selectedQuickReplyVariables,
    quickReplyPreview,
    quickReplySuggestions,
    insertQuickReply,
    sendMessage,
    handleScheduleMessage,
  } = composer;

  const performThreadAction = (
    action: "archive" | "pin" | "read" | "star" | "unarchive" | "unpin" | "unstar",
  ) => {
    if (!activeConversationId) {
      return;
    }

    threadMutation.mutate({
      action,
      conversationId: activeConversationId,
    });
    setActionsOpen(false);
  };

  return (
    <>
      <InboxLayout
        hasDetail={Boolean(detail)}
        isContactInfoOpen={contactInfoOpen}
        threadList={
          <InboxThreadList
            activeConversationId={activeConversationId}
            filter={filter}
            isLoading={threadsQuery.isPending || threadsQuery.isLoading}
            onFilterChange={setFilter}
            onSearchChange={setSearch}
            onSelectConversation={setSelectedConversationId}
            search={search}
            threads={threads}
          />
        }
      >
        <InboxChatWindow
          actionsOpen={actionsOpen}
          agents={agentsQuery.data?.agents || []}
          composer={
            <ChatComposer
              composerBody={composerBody}
              composerFeedback={composerFeedback}
              composerMenuOpen={composerMenuOpen}
              contactId={detail?.contact._id}
              isPatchingQuickReply={patchQuickReplyMutation.isPending}
              isScheduling={createScheduledMessageMutation.isPending}
              isSending={sendTextMutation.isPending}
              onComposerBodyChange={setComposerBody}
              onComposerMenuOpenChange={setComposerMenuOpen}
              onInsertQuickReply={insertQuickReply}
              onPatchQuickReplyVars={(id, vars) =>
                patchQuickReplyMutation.mutate({
                  payload: { variables: vars },
                  quickReplyId: id,
                })
              }
              onQuickReplyPanelOpenChange={setQuickReplyPanelOpen}
              onQuickReplyVariableValuesChange={setQuickReplyVariableValues}
              onScheduleDialogOpenChange={setScheduleDialogOpen}
              onScheduleMessage={handleScheduleMessage}
              onScheduledDateChange={setScheduledDate}
              onScheduledRuleChange={setScheduledRule}
              onScheduledTypeChange={setScheduledType}
              onSelectQuickReplyId={setSelectedQuickReplyId}
              onSendMessage={sendMessage}
              quickReplies={quickReplies}
              quickReplyPanelOpen={quickReplyPanelOpen}
              quickReplyPreview={quickReplyPreview}
              quickReplySuggestions={quickReplySuggestions}
              quickReplyVariableValues={quickReplyVariableValues}
              scheduleDialogOpen={scheduleDialogOpen}
              scheduledDate={scheduledDate}
              scheduledRule={scheduledRule}
              scheduledType={scheduledType}
              selectedQuickReply={selectedQuickReply}
              selectedQuickReplyId={selectedQuickReplyId}
              selectedQuickReplyVariables={selectedQuickReplyVariables}
            />
          }
          detail={detail}
          isLoadingDetail={detailQuery.isPending || detailQuery.isLoading}
          isSyncingHistory={syncHistoryMutation.isPending}
          isTransferringAgent={transferAgentMutation.isPending}
          messageList={
            <ChatMessageList
              hasMoreOlderMessages={hasMoreOlderMessages}
              isLoadingDetail={detailQuery.isLoading}
              isLoadingNextBatch={isLoadingNextBatch}
              messageGroups={messageGroups}
              messagesContainerRef={messagesContainerRef}
              messagesEndRef={messagesEndRef}
              newMessageCount={newMessageCount}
              onImageClick={(id) => setLightboxImageId(id)}
              onJumpToBottom={() => {
                setNewMessageCount(0);
                scrollToBottom(true);
              }}
              onScroll={handleMessageContainerScroll}
              paginationError={paginationError}
              retryLoadOlder={retryLoadOlder}
              showJumpToBottom={showJumpToBottom}
            />
          }
          onActionsOpenChange={setActionsOpen}
          onOpenContactInfo={() => setContactInfoOpen(true)}
          onPerformThreadAction={performThreadAction}
          onSyncHistory={handleSyncHistory}
          onTransferAgent={(targetAgentId) => {
            if (!detail) return;
            transferAgentMutation.mutate({
              conversationId: detail.conversation._id,
              agentId: targetAgentId,
            });
          }}
          onUpdateAIMode={(nextMode) => {
            if (!detail) return;
            updateAIModeMutation.mutate({
              conversationId: detail.conversation._id,
              aiMode: nextMode,
            });
          }}
        />

        {detail && contactInfoOpen ? (
          <InboxContactSidebar
            activities={detail.activities}
            availableLabels={availableLabels}
            contactLabels={contactLabels}
            detail={detail}
            editAvatarUrl={editAvatarUrl}
            editCompany={editCompany}
            editDisplayName={editDisplayName}
            editEmail={editEmail}
            editingContact={editingContact}
            editingNoteContent={editingNoteContent}
            editingNoteId={editingNoteId}
            isAddingLabel={addLabelMutation.isPending}
            isCancelingTask={cancelTaskMutation.isPending}
            isCompletingTask={completeTaskMutation.isPending}
            isCreatingNote={createNoteMutation.isPending}
            isCreatingTask={createTaskMutation.isPending}
            isDeletingNote={deleteNoteMutation.isPending}
            isPatchingNote={patchNoteMutation.isPending}
            isRemovingLabel={removeLabelMutation.isPending}
            isSavingContact={patchContactMutation.isPending}
            noteContent={noteContent}
            notePinned={notePinned}
            notes={detail.notes}
            onAddLabel={() => {
              if (!selectedLabelId) return;
              addLabelMutation.mutate(
                { contactId: detail.contact._id, labelId: selectedLabelId },
                { onSuccess: () => setSelectedLabelId("") },
              );
            }}
            onAddNote={() => {
              if (!noteContent.trim()) return;
              createNoteMutation.mutate(
                {
                  contactId: detail.contact._id,
                  payload: {
                    content: noteContent.trim(),
                    conversationId: activeConversationId ?? undefined,
                    pinned: notePinned,
                  },
                },
                {
                  onSuccess: () => {
                    setNoteContent("");
                    setNotePinned(false);
                  },
                },
              );
            }}
            onAddTask={() => {
              if (!taskTitle.trim()) return;
              createTaskMutation.mutate(
                {
                  contactId: detail.contact._id,
                  conversationId: activeConversationId ?? undefined,
                  dueAt: toIsoFromDateInput(taskDueDate),
                  priority: taskPriority,
                  title: taskTitle.trim(),
                },
                {
                  onSuccess: () => {
                    setTaskTitle("");
                    setTaskDueDate("");
                    setTaskPriority("medium");
                  },
                },
              );
            }}
            onCancelTask={(taskId) => cancelTaskMutation.mutate(taskId)}
            onClose={() => setContactInfoOpen(false)}
            onCompleteTask={(taskId) => completeTaskMutation.mutate(taskId)}
            onDeleteNote={(noteId) => deleteNoteMutation.mutate(noteId)}
            onEditAvatarUrlChange={setEditAvatarUrl}
            onEditCompanyChange={setEditCompany}
            onEditDisplayNameChange={setEditDisplayName}
            onEditEmailChange={setEditEmail}
            onEditingContactChange={setEditingContact}
            onEditingNoteContentChange={setEditingNoteContent}
            onEditingNoteIdChange={setEditingNoteId}
            onNoteContentChange={setNoteContent}
            onNotePinnedChange={setNotePinned}
            onRemoveLabel={(labelId) =>
              removeLabelMutation.mutate({ contactId: detail.contact._id, labelId })
            }
            onSaveContact={() => {
              if (!editDisplayName.trim()) return;
              patchContactMutation.mutate(
                {
                  contactId: detail.contact._id,
                  payload: {
                    avatarUrl: editAvatarUrl.trim(),
                    company: editCompany.trim(),
                    displayName: editDisplayName.trim(),
                    email: editEmail.trim(),
                  },
                },
                {
                  onSuccess: () => setEditingContact(false),
                },
              );
            }}
            onSaveNoteEdit={(noteId) => {
              if (!editingNoteContent.trim()) return;
              patchNoteMutation.mutate(
                { noteId, payload: { content: editingNoteContent.trim() } },
                {
                  onSuccess: () => {
                    setEditingNoteId(null);
                    setEditingNoteContent("");
                  },
                },
              );
            }}
            onSelectLabelId={setSelectedLabelId}
            onTaskDueDateChange={setTaskDueDate}
            onTaskPriorityChange={setTaskPriority}
            onTaskTitleChange={setTaskTitle}
            onTogglePinNote={(noteId, currentPinned) =>
              setNotePinnedMutation.mutate({ noteId, pinned: !currentPinned })
            }
            scheduledItems={scheduledItems}
            selectedLabelId={selectedLabelId}
            taskDueDate={taskDueDate}
            taskPriority={taskPriority}
            taskTitle={taskTitle}
            tasks={tasks}
          />
        ) : null}
      </InboxLayout>

      {lightboxImageId ? (
        <ImageLightboxModal
          images={lightboxImages}
          initialIndex={Math.max(
            0,
            lightboxImages.findIndex((img: { messageId: string }) => img.messageId === lightboxImageId),
          )}
          onClose={() => setLightboxImageId(null)}
        />
      ) : null}
    </>
  );
}
