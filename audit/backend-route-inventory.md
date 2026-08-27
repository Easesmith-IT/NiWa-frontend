# NIWA BACKEND — COMPLETE ROUTE INVENTORY

## Backend Architecture Summary

- **Repository**: `NiWa-backend` (`origin/main`)
- **Git Commit**: `de4488bdb0b855fb56877ed3758ab7a4ae361100`
- **Total Mounted Routes**: **140**
- **V1 Routes**: **109**
- **Legacy Compatibility Router Mounts**: **11**
- **External Webhook Routes**: **2** (`GET /webhook/meta`, `POST /webhook/meta`)
- **System Probe Routes**: **3** (`GET /health`, `GET /ready`, `GET /`)

---

## Complete Route Table

| # | Method | Path | Mounted Router | Controller | Middleware Chain | Used By Frontend? | Type |
|---|---|---|---|---|---|---|---|
| 1 | `GET` | `/health` | `app.ts` | `anonymous` | `` | No | System / External |
| 2 | `GET` | `/ready` | `app.ts` | `anonymous` | `` | No | System / External |
| 3 | `GET` | `/` | `app.ts` | `anonymous` | `` | No | System / External |
| 4 | `GET` | `/webhook/meta` | `meta-webhook.ts` | `verifyWebhook` | `` | No | System / External |
| 5 | `POST` | `/webhook/meta` | `meta-webhook.ts` | `receiveWebhook` | `` | No | System / External |
| 6 | `GET` | `/api/v1/contacts/:contactId/activities` | `v1.ts` | `getContactActivitiesV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 7 | `GET` | `/api/v1/ai-agent/settings` | `v1.ts` | `getAISettings` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 8 | `PUT` | `/api/v1/ai-agent/settings` | `v1.ts` | `updateAISettings` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 9 | `GET` | `/api/v1/ai-agent/agents` | `v1.ts` | `listAgents` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 10 | `POST` | `/api/v1/ai-agent/agents` | `v1.ts` | `createAgent` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 11 | `PUT` | `/api/v1/ai-agent/agents/:id` | `v1.ts` | `updateAgent` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 12 | `DELETE` | `/api/v1/ai-agent/agents/:id` | `v1.ts` | `deleteAgent` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 13 | `POST` | `/api/v1/ai-agent/agents/:id/default` | `v1.ts` | `setDefaultAgentController` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 14 | `PATCH` | `/api/v1/conversations/:conversationId/agent` | `v1.ts` | `transferConversationAgent` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 15 | `GET` | `/api/v1/ai-agent/templates` | `v1.ts` | `getAITemplates` | `requireAuth` | **Yes** | Canonical V1 |
| 16 | `POST` | `/api/v1/ai-agent/templates/:templateId/apply` | `v1.ts` | `applyAITemplate` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 17 | `POST` | `/api/v1/ai-agent/test` | `v1.ts` | `testAIPromptPlayground` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 18 | `GET` | `/api/v1/ai-agent/activity` | `v1.ts` | `getAIActivityLogs` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 19 | `GET` | `/api/v1/ai-agent/knowledge` | `v1.ts` | `listKnowledgeSources` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 20 | `POST` | `/api/v1/ai-agent/knowledge` | `v1.ts` | `createKnowledgeSource` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 21 | `PATCH` | `/api/v1/ai-agent/knowledge/:id` | `v1.ts` | `updateKnowledgeSource` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 22 | `PATCH` | `/api/v1/ai-agent/knowledge/:id/status` | `v1.ts` | `toggleKnowledgeSourceStatus` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 23 | `DELETE` | `/api/v1/ai-agent/knowledge/:id` | `v1.ts` | `deleteKnowledgeSource` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 24 | `GET` | `/api/v1/ai-agent/knowledge-packs` | `v1.ts` | `getKnowledgePacks` | `requireAuth` | **Yes** | Canonical V1 |
| 25 | `PATCH` | `/api/v1/conversations/:conversationId/ai-mode` | `v1.ts` | `updateConversationAIMode` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 26 | `POST` | `/api/v1/auth/login` | `v1.ts` | `login` | `loginRateLimit` | **Yes** | Canonical V1 |
| 27 | `POST` | `/api/v1/auth/logout` | `v1.ts` | `logout` | `` | **Yes** | Canonical V1 |
| 28 | `POST` | `/api/v1/auth/refresh` | `v1.ts` | `refresh` | `refreshRateLimit` | **Yes** | Canonical V1 |
| 29 | `GET` | `/api/v1/auth/profile` | `v1.ts` | `profile` | `requireAuth` | **Yes** | Canonical V1 |
| 30 | `PUT` | `/api/v1/auth/profile` | `v1.ts` | `updateCurrentProfile` | `requireAuth` | **Yes** | Canonical V1 |
| 31 | `POST` | `/api/v1/auth/change-password` | `v1.ts` | `changeCurrentPassword` | `requireAuth, passwordRateLimit` | **Yes** | Canonical V1 |
| 32 | `GET` | `/api/v1/automations` | `v1.ts` | `getAutomationsV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 33 | `POST` | `/api/v1/automations` | `v1.ts` | `postAutomationV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 34 | `PATCH` | `/api/v1/automations/:automationId` | `v1.ts` | `patchAutomationV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 35 | `POST` | `/api/v1/automations/:automationId/activate` | `v1.ts` | `postAutomationActivateV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 36 | `POST` | `/api/v1/automations/:automationId/archive` | `v1.ts` | `postAutomationArchiveV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 37 | `POST` | `/api/v1/automations/:automationId/pause` | `v1.ts` | `postAutomationPauseV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 38 | `POST` | `/api/v1/automations/:automationId/test` | `v1.ts` | `postAutomationTestV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 39 | `GET` | `/api/v1/automations/runs` | `v1.ts` | `getAutomationRunsV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 40 | `GET` | `/api/v1/automations/runs/:runId` | `v1.ts` | `getAutomationRunV1ById` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 41 | `POST` | `/api/v1/campaigns` | `v1.ts` | `createCampaign` | `requireAuth, requireWorkspaceMembership` | **Yes** | Canonical V1 |
| 42 | `GET` | `/api/v1/campaigns` | `v1.ts` | `getCampaigns` | `requireAuth, requireWorkspaceMembership` | **Yes** | Canonical V1 |
| 43 | `GET` | `/api/v1/campaigns/:id` | `v1.ts` | `getCampaignById` | `requireAuth, requireWorkspaceMembership` | **Yes** | Canonical V1 |
| 44 | `POST` | `/api/v1/campaigns/:id/status` | `v1.ts` | `updateCampaignStatus` | `requireAuth, requireWorkspaceMembership` | **Yes** | Canonical V1 |
| 45 | `POST` | `/api/v1/campaigns/:id/validate` | `v1.ts` | `validateCampaign` | `requireAuth, requireWorkspaceMembership` | **Yes** | Canonical V1 |
| 46 | `GET` | `/api/v1/campaigns/:id/recipients` | `v1.ts` | `getCampaignRecipients` | `requireAuth, requireWorkspaceMembership` | **Yes** | Canonical V1 |
| 47 | `DELETE` | `/api/v1/campaigns/:id` | `v1.ts` | `deleteCampaign` | `requireAuth, requireWorkspaceMembership` | **Yes** | Canonical V1 |
| 48 | `GET` | `/api/v1/campaigns/:id/export` | `v1.ts` | `exportCampaignRecipients` | `requireAuth, requireWorkspaceMembership` | **Yes** | Canonical V1 |
| 49 | `PATCH` | `/api/v1/campaigns/:id/draft` | `v1.ts` | `updateDraftCampaign` | `requireAuth, requireWorkspaceMembership` | **Yes** | Canonical V1 |
| 50 | `GET` | `/api/v1/contacts` | `v1.ts` | `getContactsV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 51 | `POST` | `/api/v1/contacts` | `v1.ts` | `postContactV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 52 | `PATCH` | `/api/v1/contacts/:contactId` | `v1.ts` | `patchContactV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 53 | `DELETE` | `/api/v1/contacts/:contactId` | `v1.ts` | `deleteContactRouteV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 54 | `POST` | `/api/v1/contacts/:contactId/labels` | `v1.ts` | `postContactLabelV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 55 | `DELETE` | `/api/v1/contacts/:contactId/labels/:labelId` | `v1.ts` | `deleteContactLabelRouteV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 56 | `GET` | `/api/v1/contacts/export` | `v1.ts` | `getContactsExportV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 57 | `GET` | `/api/v1/contacts/duplicates` | `v1.ts` | `getContactDuplicatesV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 58 | `POST` | `/api/v1/contacts/merge` | `v1.ts` | `postContactMergeV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 59 | `POST` | `/api/v1/contact-imports/upload` | `v1.ts` | `uploadFile` | `requireAuth, requireWorkspace, multer` | **Yes** | Canonical V1 |
| 60 | `POST` | `/api/v1/contact-imports/:importId/validate` | `v1.ts` | `validateImport` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 61 | `POST` | `/api/v1/contact-imports/:importId/commit` | `v1.ts` | `commitImport` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 62 | `GET` | `/api/v1/contact-imports/:importId` | `v1.ts` | `getImport` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 63 | `GET` | `/api/v1/contact-imports` | `v1.ts` | `getImportsList` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 64 | `GET` | `/api/v1/conversations` | `v1.ts` | `getConversationsV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 65 | `GET` | `/api/v1/conversations/:conversationId` | `v1.ts` | `getConversationV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 66 | `POST` | `/api/v1/conversations/reply` | `v1.ts` | `postConversationReply` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 67 | `POST` | `/api/v1/conversations/:conversationId/read` | `v1.ts` | `postConversationReadV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 68 | `PUT` | `/api/v1/conversations/:conversationId/labels` | `v1.ts` | `putConversationLabels` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 69 | `POST` | `/api/v1/conversations/:conversationId/notes` | `v1.ts` | `postConversationNote` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 70 | `PATCH` | `/api/v1/conversations/:conversationId/notes/:noteId` | `v1.ts` | `patchConversationNote` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 71 | `GET` | `/api/v1/inbox` | `v1.ts` | `getInboxThreadsV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 72 | `GET` | `/api/v1/inbox/:conversationId` | `v1.ts` | `getInboxThreadV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 73 | `POST` | `/api/v1/inbox/:conversationId/archive` | `v1.ts` | `postInboxThreadArchiveV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 74 | `POST` | `/api/v1/inbox/:conversationId/pin` | `v1.ts` | `postInboxThreadPinV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 75 | `POST` | `/api/v1/inbox/:conversationId/read` | `v1.ts` | `postInboxThreadReadV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 76 | `POST` | `/api/v1/inbox/:conversationId/star` | `v1.ts` | `postInboxThreadStarV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 77 | `POST` | `/api/v1/inbox/:conversationId/unarchive` | `v1.ts` | `postInboxThreadUnarchiveV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 78 | `POST` | `/api/v1/inbox/:conversationId/unpin` | `v1.ts` | `postInboxThreadUnpinV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 79 | `POST` | `/api/v1/inbox/:conversationId/unstar` | `v1.ts` | `postInboxThreadUnstarV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 80 | `POST` | `/api/v1/inbox/:conversationId/sync-history` | `v1.ts` | `postInboxThreadSyncHistoryV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 81 | `GET` | `/api/v1/labels` | `v1.ts` | `getLabelsV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 82 | `POST` | `/api/v1/labels` | `v1.ts` | `postLabelV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 83 | `PATCH` | `/api/v1/labels/:labelId` | `v1.ts` | `patchLabelV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 84 | `DELETE` | `/api/v1/labels/:labelId` | `v1.ts` | `deleteLabelRouteV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 85 | `GET` | `/api/v1/logs/api` | `v1.ts` | `getApiLogs` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 86 | `GET` | `/api/v1/logs/webhooks` | `v1.ts` | `getWebhookLogs` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 87 | `GET` | `/api/v1/media` | `v1.ts` | `getMedia` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 88 | `GET` | `/api/v1/media/:id` | `v1.ts` | `getMediaDetail` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 89 | `POST` | `/api/v1/media/upload` | `v1.ts` | `postMediaUpload` | `requireAuth, requireWorkspace, multer` | **Yes** | Canonical V1 |
| 90 | `DELETE` | `/api/v1/media/:id` | `v1.ts` | `removeMedia` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 91 | `PATCH` | `/api/v1/media/:id` | `v1.ts` | `patchMediaMetadata` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 92 | `GET` | `/api/v1/messages` | `v1.ts` | `getMessagesV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 93 | `POST` | `/api/v1/messages/text` | `v1.ts` | `postTextMessageV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 94 | `GET` | `/api/v1/messages/:messageId/media` | `v1.ts` | `getMessageMediaV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 95 | `POST` | `/api/v1/messages/read` | `v1.ts` | `postReadMessage` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 96 | `POST` | `/api/v1/messages/template` | `v1.ts` | `postTemplateMessage` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 97 | `POST` | `/api/v1/messages/image` | `v1.ts` | `postMediaMessage` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 98 | `POST` | `/api/v1/messages/video` | `v1.ts` | `postMediaMessage` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 99 | `POST` | `/api/v1/messages/audio` | `v1.ts` | `postMediaMessage` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 100 | `POST` | `/api/v1/messages/document` | `v1.ts` | `postMediaMessage` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 101 | `POST` | `/api/v1/messages/sticker` | `v1.ts` | `postMediaMessage` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 102 | `POST` | `/api/v1/messages/location` | `v1.ts` | `postLocationMessage` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 103 | `POST` | `/api/v1/messages/contact` | `v1.ts` | `postContactMessage` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 104 | `POST` | `/api/v1/messages/button` | `v1.ts` | `postButtonMessage` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 105 | `POST` | `/api/v1/messages/list` | `v1.ts` | `postListMessage` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 106 | `POST` | `/api/v1/messages/reaction` | `v1.ts` | `postReactionMessage` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 107 | `POST` | `/api/v1/messages/cta-url` | `v1.ts` | `postCtaUrlMessage` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 108 | `POST` | `/api/v1/messages/location-request` | `v1.ts` | `postLocationRequestMessage` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 109 | `POST` | `/api/v1/messages/typing-indicator` | `v1.ts` | `postTypingIndicator` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 110 | `GET` | `/api/v1/contacts/:contactId/notes` | `v1.ts` | `getContactNotesV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 111 | `POST` | `/api/v1/contacts/:contactId/notes` | `v1.ts` | `postContactNoteV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 112 | `PATCH` | `/api/v1/notes/:noteId` | `v1.ts` | `patchNoteV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 113 | `DELETE` | `/api/v1/notes/:noteId` | `v1.ts` | `deleteNoteRouteV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 114 | `POST` | `/api/v1/notes/:noteId/pin` | `v1.ts` | `postNotePinV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 115 | `POST` | `/api/v1/notes/:noteId/unpin` | `v1.ts` | `postNoteUnpinV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 116 | `GET` | `/api/v1/quick-replies` | `v1.ts` | `getQuickRepliesV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 117 | `POST` | `/api/v1/quick-replies` | `v1.ts` | `postQuickReplyV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 118 | `PATCH` | `/api/v1/quick-replies/:quickReplyId` | `v1.ts` | `patchQuickReplyV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 119 | `GET` | `/api/v1/quotas` | `v1.ts` | `asyncHandler` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 120 | `GET` | `/api/v1/quotas/forecast` | `v1.ts` | `asyncHandler` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 121 | `GET` | `/api/v1/scheduled-messages` | `v1.ts` | `getScheduledMessagesV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 122 | `POST` | `/api/v1/scheduled-messages` | `v1.ts` | `postScheduledMessageV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 123 | `PATCH` | `/api/v1/scheduled-messages/:scheduledMessageId` | `v1.ts` | `patchScheduledMessageV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 124 | `POST` | `/api/v1/scheduled-messages/:scheduledMessageId/cancel` | `v1.ts` | `postScheduledMessageCancelV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 125 | `POST` | `/api/v1/scheduled-messages/:scheduledMessageId/pause` | `v1.ts` | `postScheduledMessagePauseV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 126 | `POST` | `/api/v1/scheduled-messages/:scheduledMessageId/resume` | `v1.ts` | `postScheduledMessageResumeV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 127 | `POST` | `/api/v1/scheduled-messages/:scheduledMessageId/retry` | `v1.ts` | `postScheduledMessageRetryV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 128 | `GET` | `/api/v1/search` | `v1.ts` | `getGlobalSearchV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 129 | `GET` | `/api/v1/search/inbox` | `v1.ts` | `getInboxSearchV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 130 | `GET` | `/api/v1/dashboard` | `v1.ts` | `getDashboardV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 131 | `GET` | `/api/v1/settings` | `v1.ts` | `getSettings` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 132 | `PUT` | `/api/v1/settings` | `v1.ts` | `updateSettings` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 133 | `POST` | `/api/v1/settings/test-connection` | `v1.ts` | `testConnection` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 134 | `GET` | `/api/v1/tasks` | `v1.ts` | `getTasksV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 135 | `POST` | `/api/v1/tasks` | `v1.ts` | `postTaskV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 136 | `POST` | `/api/v1/tasks/:taskId/complete` | `v1.ts` | `postTaskCompleteV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 137 | `POST` | `/api/v1/tasks/:taskId/cancel` | `v1.ts` | `postTaskCancelV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 138 | `PATCH` | `/api/v1/tasks/:taskId` | `v1.ts` | `patchTaskV1` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 139 | `GET` | `/api/v1/templates` | `v1.ts` | `getTemplates` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 140 | `POST` | `/api/v1/templates/sync` | `v1.ts` | `syncTemplates` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 141 | `GET` | `/api/v1/webhooks` | `v1.ts` | `getWebhookOverview` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 142 | `POST` | `/api/v1/webhooks/test` | `v1.ts` | `testWebhook` | `requireAuth, requireWorkspace, webhookTestRateLimit` | **Yes** | Canonical V1 |
| 143 | `POST` | `/api/v1/webhooks/reconcile` | `v1.ts` | `reconcileWebhookSubscription` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 144 | `GET` | `/api/v1/whatsapp/connections` | `v1.ts` | `getConnectionsHandler` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 145 | `POST` | `/api/v1/whatsapp/connections/:connectionId/sync` | `v1.ts` | `syncConnectionHandler` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 146 | `POST` | `/api/v1/whatsapp/connections/:connectionId/health` | `v1.ts` | `checkHealthHandler` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 147 | `DELETE` | `/api/v1/whatsapp/connections/:connectionId` | `v1.ts` | `disconnectConnectionHandler` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 148 | `POST` | `/api/v1/whatsapp/connections/embedded-signup/complete` | `v1.ts` | `completeEmbeddedSignupHandler` | `requireAuth, requireWorkspace` | **Yes** | Canonical V1 |
| 149 | `WS` | `/socket.io` | `v1.ts` | `setupSocketServer` | `Socket.IO Handshake Auth` | **Yes** | Canonical V1 |
| 150 | `ANY` | `/api/ai-agent` | `index.ts` | Forward to V1 Router | None | No | Legacy Alias |
| 151 | `ANY` | `/api/auth` | `index.ts` | Forward to V1 Router | None | No | Legacy Alias |
| 152 | `ANY` | `/api/conversations` | `index.ts` | Forward to V1 Router | None | No | Legacy Alias |
| 153 | `ANY` | `/api/dashboard` | `index.ts` | Forward to V1 Router | None | No | Legacy Alias |
| 154 | `ANY` | `/api/logs` | `index.ts` | Forward to V1 Router | None | No | Legacy Alias |
| 155 | `ANY` | `/api/media` | `index.ts` | Forward to V1 Router | None | No | Legacy Alias |
| 156 | `ANY` | `/api/messages` | `index.ts` | Forward to V1 Router | None | No | Legacy Alias |
| 157 | `ANY` | `/api/settings` | `index.ts` | Forward to V1 Router | None | No | Legacy Alias |
| 158 | `ANY` | `/api/templates` | `index.ts` | Forward to V1 Router | None | No | Legacy Alias |
| 159 | `ANY` | `/api/webhooks` | `index.ts` | Forward to V1 Router | None | No | Legacy Alias |
| 160 | `ANY` | `/api/whatsapp/connections` | `index.ts` | Forward to V1 Router | None | No | Legacy Alias |
