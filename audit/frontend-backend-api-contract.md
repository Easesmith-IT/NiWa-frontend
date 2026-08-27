# NIWA FRONTEND ↔ BACKEND API CONTRACT MATRIX

## Executive Contract Parity Matrix

Every frontend API call site has been traced through to its corresponding backend controller, service, database model, and middleware chain.

| # | Frontend Method | Frontend Path | Backend Method | Backend Path | Controller | Middleware | Model | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | `GET` | `/api/v1/contacts/:contactId/activities` | `GET` | `/api/v1/contacts/:contactId/activities` | `getContactActivitiesV1` | `requireAuth, requireWorkspace` | `ActivityRecordV1` | **MATCH** |
| 2 | `GET` | `/api/v1/ai-agent/settings` | `GET` | `/api/v1/ai-agent/settings` | `getAISettings` | `requireAuth, requireWorkspace` | `BusinessAISettingsModel` | **MATCH** |
| 3 | `PUT` | `/api/v1/ai-agent/settings` | `PUT` | `/api/v1/ai-agent/settings` | `updateAISettings` | `requireAuth, requireWorkspace` | `BusinessAISettingsModel` | **MATCH** |
| 4 | `GET` | `/api/v1/ai-agent/agents` | `GET` | `/api/v1/ai-agent/agents` | `listAgents` | `requireAuth, requireWorkspace` | `AIAgentModel` | **MATCH** |
| 5 | `POST` | `/api/v1/ai-agent/agents` | `POST` | `/api/v1/ai-agent/agents` | `createAgent` | `requireAuth, requireWorkspace` | `AIAgentModel` | **MATCH** |
| 6 | `PUT` | `/api/v1/ai-agent/agents/:id` | `PUT` | `/api/v1/ai-agent/agents/:id` | `updateAgent` | `requireAuth, requireWorkspace` | `AIAgentModel` | **MATCH** |
| 7 | `DELETE` | `/api/v1/ai-agent/agents/:id` | `DELETE` | `/api/v1/ai-agent/agents/:id` | `deleteAgent` | `requireAuth, requireWorkspace` | `AIAgentModel` | **MATCH** |
| 8 | `POST` | `/api/v1/ai-agent/agents/:id/default` | `POST` | `/api/v1/ai-agent/agents/:id/default` | `setDefaultAgentController` | `requireAuth, requireWorkspace` | `AIAgentModel` | **MATCH** |
| 9 | `PATCH` | `/api/v1/conversations/:conversationId/agent` | `PATCH` | `/api/v1/conversations/:conversationId/agent` | `transferConversationAgent` | `requireAuth, requireWorkspace` | `ConversationModelV1` | **MATCH** |
| 10 | `GET` | `/api/v1/ai-agent/templates` | `GET` | `/api/v1/ai-agent/templates` | `getAITemplates` | `requireAuth` | `Static Config` | **MATCH** |
| 11 | `POST` | `/api/v1/ai-agent/templates/:templateId/apply` | `POST` | `/api/v1/ai-agent/templates/:templateId/apply` | `applyAITemplate` | `requireAuth, requireWorkspace` | `BusinessAISettingsModel` | **MATCH** |
| 12 | `POST` | `/api/v1/ai-agent/test` | `POST` | `/api/v1/ai-agent/test` | `testAIPromptPlayground` | `requireAuth, requireWorkspace` | `AI Orchestrator` | **MATCH** |
| 13 | `GET` | `/api/v1/ai-agent/activity` | `GET` | `/api/v1/ai-agent/activity` | `getAIActivityLogs` | `requireAuth, requireWorkspace` | `AIActivityLogModel` | **MATCH** |
| 14 | `GET` | `/api/v1/ai-agent/knowledge` | `GET` | `/api/v1/ai-agent/knowledge` | `listKnowledgeSources` | `requireAuth, requireWorkspace` | `KnowledgeSourceModel` | **MATCH** |
| 15 | `POST` | `/api/v1/ai-agent/knowledge` | `POST` | `/api/v1/ai-agent/knowledge` | `createKnowledgeSource` | `requireAuth, requireWorkspace` | `KnowledgeSourceModel` | **MATCH** |
| 16 | `PATCH` | `/api/v1/ai-agent/knowledge/:id` | `PATCH` | `/api/v1/ai-agent/knowledge/:id` | `updateKnowledgeSource` | `requireAuth, requireWorkspace` | `KnowledgeSourceModel` | **MATCH** |
| 17 | `PATCH` | `/api/v1/ai-agent/knowledge/:id/status` | `PATCH` | `/api/v1/ai-agent/knowledge/:id/status` | `toggleKnowledgeSourceStatus` | `requireAuth, requireWorkspace` | `KnowledgeSourceModel` | **MATCH** |
| 18 | `DELETE` | `/api/v1/ai-agent/knowledge/:id` | `DELETE` | `/api/v1/ai-agent/knowledge/:id` | `deleteKnowledgeSource` | `requireAuth, requireWorkspace` | `KnowledgeSourceModel` | **MATCH** |
| 19 | `GET` | `/api/v1/ai-agent/knowledge-packs` | `GET` | `/api/v1/ai-agent/knowledge-packs` | `getKnowledgePacks` | `requireAuth` | `Static Config` | **MATCH** |
| 20 | `PATCH` | `/api/v1/conversations/:conversationId/ai-mode` | `PATCH` | `/api/v1/conversations/:id/ai-mode` | `updateConversationAIMode` | `requireAuth, requireWorkspace` | `ConversationModelV1` | **MATCH** |
| 21 | `POST` | `/api/v1/auth/login` | `POST` | `/api/v1/auth/login` | `login` | `loginRateLimit` | `OperatorModel` | **MATCH** |
| 22 | `POST` | `/api/v1/auth/logout` | `POST` | `/api/v1/auth/logout` | `logout` | `` | `OperatorModel` | **MATCH** |
| 23 | `POST` | `/api/v1/auth/refresh` | `POST` | `/api/v1/auth/refresh` | `refresh` | `refreshRateLimit` | `OperatorModel` | **MATCH** |
| 24 | `GET` | `/api/v1/auth/profile` | `GET` | `/api/v1/auth/profile` | `profile` | `requireAuth` | `OperatorModel` | **MATCH** |
| 25 | `PUT` | `/api/v1/auth/profile` | `PUT` | `/api/v1/auth/profile` | `updateCurrentProfile` | `requireAuth` | `OperatorModel` | **MATCH** |
| 26 | `POST` | `/api/v1/auth/change-password` | `POST` | `/api/v1/auth/change-password` | `changeCurrentPassword` | `requireAuth, passwordRateLimit` | `OperatorModel` | **MATCH** |
| 27 | `GET` | `/api/v1/automations` | `GET` | `/api/v1/automations` | `getAutomationsV1` | `requireAuth, requireWorkspace` | `AutomationModelV1` | **MATCH** |
| 28 | `POST` | `/api/v1/automations` | `POST` | `/api/v1/automations` | `postAutomationV1` | `requireAuth, requireWorkspace` | `AutomationModelV1` | **MATCH** |
| 29 | `PATCH` | `/api/v1/automations/:automationId` | `PATCH` | `/api/v1/automations/:id` | `patchAutomationV1` | `requireAuth, requireWorkspace` | `AutomationModelV1` | **MATCH** |
| 30 | `POST` | `/api/v1/automations/:automationId/activate` | `POST` | `/api/v1/automations/:id/activate` | `postAutomationActivateV1` | `requireAuth, requireWorkspace` | `AutomationModelV1` | **MATCH** |
| 31 | `POST` | `/api/v1/automations/:automationId/archive` | `POST` | `/api/v1/automations/:id/archive` | `postAutomationArchiveV1` | `requireAuth, requireWorkspace` | `AutomationModelV1` | **MATCH** |
| 32 | `POST` | `/api/v1/automations/:automationId/pause` | `POST` | `/api/v1/automations/:id/pause` | `postAutomationPauseV1` | `requireAuth, requireWorkspace` | `AutomationModelV1` | **MATCH** |
| 33 | `POST` | `/api/v1/automations/:automationId/test` | `POST` | `/api/v1/automations/:id/test` | `postAutomationTestV1` | `requireAuth, requireWorkspace` | `AutomationRunModelV1` | **MATCH** |
| 34 | `GET` | `/api/v1/automations/runs` | `GET` | `/api/v1/automations/runs` | `getAutomationRunsV1` | `requireAuth, requireWorkspace` | `AutomationRunModelV1` | **MATCH** |
| 35 | `GET` | `/api/v1/automations/runs/:runId` | `GET` | `/api/v1/automations/runs/:runId` | `getAutomationRunV1ById` | `requireAuth, requireWorkspace` | `AutomationRunModelV1` | **MATCH** |
| 36 | `POST` | `/api/v1/campaigns` | `POST` | `/api/v1/campaigns` | `createCampaign` | `requireAuth, requireWorkspaceMembership` | `CampaignModelV1` | **MATCH** |
| 37 | `GET` | `/api/v1/campaigns` | `GET` | `/api/v1/campaigns` | `getCampaigns` | `requireAuth, requireWorkspaceMembership` | `CampaignModelV1` | **MATCH** |
| 38 | `GET` | `/api/v1/campaigns/:id` | `GET` | `/api/v1/campaigns/:id` | `getCampaignById` | `requireAuth, requireWorkspaceMembership` | `CampaignModelV1` | **MATCH** |
| 39 | `POST` | `/api/v1/campaigns/:id/status` | `POST` | `/api/v1/campaigns/:id/status` | `updateCampaignStatus` | `requireAuth, requireWorkspaceMembership` | `CampaignModelV1` | **MATCH** |
| 40 | `POST` | `/api/v1/campaigns/:id/validate` | `POST` | `/api/v1/campaigns/:id/validate` | `validateCampaign` | `requireAuth, requireWorkspaceMembership` | `CampaignModelV1` | **MATCH** |
| 41 | `GET` | `/api/v1/campaigns/:id/recipients` | `GET` | `/api/v1/campaigns/:id/recipients` | `getCampaignRecipients` | `requireAuth, requireWorkspaceMembership` | `CampaignRecipientModelV1` | **MATCH** |
| 42 | `DELETE` | `/api/v1/campaigns/:id` | `DELETE` | `/api/v1/campaigns/:id` | `deleteCampaign` | `requireAuth, requireWorkspaceMembership` | `CampaignModelV1` | **MATCH** |
| 43 | `GET` | `/api/v1/campaigns/:id/export` | `GET` | `/api/v1/campaigns/:id/export` | `exportCampaignRecipients` | `requireAuth, requireWorkspaceMembership` | `CampaignRecipientModelV1` | **MATCH** |
| 44 | `PATCH` | `/api/v1/campaigns/:id/draft` | `PATCH` | `/api/v1/campaigns/:id/draft` | `updateDraftCampaign` | `requireAuth, requireWorkspaceMembership` | `CampaignModelV1` | **MATCH** |
| 45 | `GET` | `/api/v1/contacts` | `GET` | `/api/v1/contacts` | `getContactsV1` | `requireAuth, requireWorkspace` | `ContactModelV1` | **MATCH** |
| 46 | `POST` | `/api/v1/contacts` | `POST` | `/api/v1/contacts` | `postContactV1` | `requireAuth, requireWorkspace` | `ContactModelV1` | **MATCH** |
| 47 | `PATCH` | `/api/v1/contacts/:contactId` | `PATCH` | `/api/v1/contacts/:id` | `patchContactV1` | `requireAuth, requireWorkspace` | `ContactModelV1` | **MATCH** |
| 48 | `DELETE` | `/api/v1/contacts/:contactId` | `DELETE` | `/api/v1/contacts/:id` | `deleteContactRouteV1` | `requireAuth, requireWorkspace` | `ContactModelV1` | **MATCH** |
| 49 | `POST` | `/api/v1/contacts/:contactId/labels` | `POST` | `/api/v1/contacts/:id/labels` | `postContactLabelV1` | `requireAuth, requireWorkspace` | `ContactModelV1` | **MATCH** |
| 50 | `DELETE` | `/api/v1/contacts/:contactId/labels/:labelId` | `DELETE` | `/api/v1/contacts/:id/labels/:labelId` | `deleteContactLabelRouteV1` | `requireAuth, requireWorkspace` | `ContactModelV1` | **MATCH** |
| 51 | `GET` | `/api/v1/contacts/export` | `GET` | `/api/v1/contacts/export` | `getContactsExportV1` | `requireAuth, requireWorkspace` | `ContactModelV1` | **MATCH** |
| 52 | `GET` | `/api/v1/contacts/duplicates` | `GET` | `/api/v1/contacts/duplicates` | `getContactDuplicatesV1` | `requireAuth, requireWorkspace` | `ContactModelV1` | **MATCH** |
| 53 | `POST` | `/api/v1/contacts/merge` | `POST` | `/api/v1/contacts/merge` | `postContactMergeV1` | `requireAuth, requireWorkspace` | `ContactModelV1` | **MATCH** |
| 54 | `POST` | `/api/v1/contact-imports/upload` | `POST` | `/api/v1/contact-imports/upload` | `uploadFile` | `requireAuth, requireWorkspace, multer` | `ContactImportModel` | **MATCH** |
| 55 | `POST` | `/api/v1/contact-imports/:importId/validate` | `POST` | `/api/v1/contact-imports/:id/validate` | `validateImport` | `requireAuth, requireWorkspace` | `ContactImportModel` | **MATCH** |
| 56 | `POST` | `/api/v1/contact-imports/:importId/commit` | `POST` | `/api/v1/contact-imports/:id/commit` | `commitImport` | `requireAuth, requireWorkspace` | `ContactImportModel` | **MATCH** |
| 57 | `GET` | `/api/v1/contact-imports/:importId` | `GET` | `/api/v1/contact-imports/:id` | `getImport` | `requireAuth, requireWorkspace` | `ContactImportModel` | **MATCH** |
| 58 | `GET` | `/api/v1/contact-imports` | `GET` | `/api/v1/contact-imports` | `getImportsList` | `requireAuth, requireWorkspace` | `ContactImportModel` | **MATCH** |
| 59 | `GET` | `/api/v1/conversations` | `GET` | `/api/v1/conversations` | `getConversationsV1` | `requireAuth, requireWorkspace` | `ConversationModelV1` | **MATCH** |
| 60 | `GET` | `/api/v1/conversations/:conversationId` | `GET` | `/api/v1/conversations/:id` | `getConversationV1` | `requireAuth, requireWorkspace` | `ConversationModelV1` | **MATCH** |
| 61 | `POST` | `/api/v1/conversations/reply` | `POST` | `/api/v1/conversations/reply` | `postConversationReply` | `requireAuth, requireWorkspace` | `MessageModelV1` | **MATCH** |
| 62 | `POST` | `/api/v1/conversations/:conversationId/read` | `POST` | `/api/v1/conversations/:id/read` | `postConversationReadV1` | `requireAuth, requireWorkspace` | `ConversationModelV1` | **MATCH** |
| 63 | `PUT` | `/api/v1/conversations/:conversationId/labels` | `PUT` | `/api/v1/conversations/:id/labels` | `putConversationLabels` | `requireAuth, requireWorkspace` | `ConversationModelV1` | **MATCH** |
| 64 | `POST` | `/api/v1/conversations/:conversationId/notes` | `POST` | `/api/v1/conversations/:id/notes` | `postConversationNote` | `requireAuth, requireWorkspace` | `NoteModelV1` | **MATCH** |
| 65 | `PATCH` | `/api/v1/conversations/:conversationId/notes/:noteId` | `PATCH` | `/api/v1/conversations/:id/notes/:noteId` | `patchConversationNote` | `requireAuth, requireWorkspace` | `NoteModelV1` | **MATCH** |
| 66 | `GET` | `/api/v1/inbox` | `GET` | `/api/v1/inbox` | `getInboxThreadsV1` | `requireAuth, requireWorkspace` | `ConversationModelV1` | **MATCH** |
| 67 | `GET` | `/api/v1/inbox/:conversationId` | `GET` | `/api/v1/inbox/:conversationId` | `getInboxThreadV1` | `requireAuth, requireWorkspace` | `ConversationModelV1` | **MATCH** |
| 68 | `POST` | `/api/v1/inbox/:conversationId/archive` | `POST` | `/api/v1/inbox/:conversationId/archive` | `postInboxThreadArchiveV1` | `requireAuth, requireWorkspace` | `ConversationModelV1` | **MATCH** |
| 69 | `POST` | `/api/v1/inbox/:conversationId/pin` | `POST` | `/api/v1/inbox/:conversationId/pin` | `postInboxThreadPinV1` | `requireAuth, requireWorkspace` | `ConversationModelV1` | **MATCH** |
| 70 | `POST` | `/api/v1/inbox/:conversationId/read` | `POST` | `/api/v1/inbox/:conversationId/read` | `postInboxThreadReadV1` | `requireAuth, requireWorkspace` | `ConversationModelV1` | **MATCH** |
| 71 | `POST` | `/api/v1/inbox/:conversationId/star` | `POST` | `/api/v1/inbox/:conversationId/star` | `postInboxThreadStarV1` | `requireAuth, requireWorkspace` | `ConversationModelV1` | **MATCH** |
| 72 | `POST` | `/api/v1/inbox/:conversationId/unarchive` | `POST` | `/api/v1/inbox/:conversationId/unarchive` | `postInboxThreadUnarchiveV1` | `requireAuth, requireWorkspace` | `ConversationModelV1` | **MATCH** |
| 73 | `POST` | `/api/v1/inbox/:conversationId/unpin` | `POST` | `/api/v1/inbox/:conversationId/unpin` | `postInboxThreadUnpinV1` | `requireAuth, requireWorkspace` | `ConversationModelV1` | **MATCH** |
| 74 | `POST` | `/api/v1/inbox/:conversationId/unstar` | `POST` | `/api/v1/inbox/:conversationId/unstar` | `postInboxThreadUnstarV1` | `requireAuth, requireWorkspace` | `ConversationModelV1` | **MATCH** |
| 75 | `POST` | `/api/v1/inbox/:conversationId/sync-history` | `POST` | `/api/v1/inbox/:conversationId/sync-history` | `postInboxThreadSyncHistoryV1` | `requireAuth, requireWorkspace` | `MessageModelV1` | **MATCH** |
| 76 | `GET` | `/api/v1/labels` | `GET` | `/api/v1/labels` | `getLabelsV1` | `requireAuth, requireWorkspace` | `LabelModelV1` | **MATCH** |
| 77 | `POST` | `/api/v1/labels` | `POST` | `/api/v1/labels` | `postLabelV1` | `requireAuth, requireWorkspace` | `LabelModelV1` | **MATCH** |
| 78 | `PATCH` | `/api/v1/labels/:labelId` | `PATCH` | `/api/v1/labels/:id` | `patchLabelV1` | `requireAuth, requireWorkspace` | `LabelModelV1` | **MATCH** |
| 79 | `DELETE` | `/api/v1/labels/:labelId` | `DELETE` | `/api/v1/labels/:id` | `deleteLabelRouteV1` | `requireAuth, requireWorkspace` | `LabelModelV1` | **MATCH** |
| 80 | `GET` | `/api/v1/logs/api` | `GET` | `/api/v1/logs/api` | `getApiLogs` | `requireAuth, requireWorkspace` | `ApiLogModel` | **MATCH** |
| 81 | `GET` | `/api/v1/logs/webhooks` | `GET` | `/api/v1/logs/webhooks` | `getWebhookLogs` | `requireAuth, requireWorkspace` | `WebhookLogModel` | **MATCH** |
| 82 | `GET` | `/api/v1/media` | `GET` | `/api/v1/media` | `getMedia` | `requireAuth, requireWorkspace` | `MediaModel` | **MATCH** |
| 83 | `GET` | `/api/v1/media/:id` | `GET` | `/api/v1/media/:id` | `getMediaDetail` | `requireAuth, requireWorkspace` | `MediaModel` | **MATCH** |
| 84 | `POST` | `/api/v1/media/upload` | `POST` | `/api/v1/media/upload` | `postMediaUpload` | `requireAuth, requireWorkspace, multer` | `MediaModel` | **MATCH** |
| 85 | `DELETE` | `/api/v1/media/:id` | `DELETE` | `/api/v1/media/:id` | `removeMedia` | `requireAuth, requireWorkspace` | `MediaModel` | **MATCH** |
| 86 | `PATCH` | `/api/v1/media/:id` | `PATCH` | `/api/v1/media/:id` | `patchMediaMetadata` | `requireAuth, requireWorkspace` | `MediaModel` | **MATCH** |
| 87 | `GET` | `/api/v1/messages` | `GET` | `/api/v1/messages` | `getMessagesV1` | `requireAuth, requireWorkspace` | `MessageModelV1` | **MATCH** |
| 88 | `POST` | `/api/v1/messages/text` | `POST` | `/api/v1/messages/text` | `postTextMessageV1` | `requireAuth, requireWorkspace` | `MessageModelV1` | **MATCH** |
| 89 | `GET` | `/api/v1/messages/:messageId/media` | `GET` | `/api/v1/messages/:id/media` | `getMessageMediaV1` | `requireAuth, requireWorkspace` | `MessageModelV1` | **MATCH** |
| 90 | `POST` | `/api/v1/messages/read` | `POST` | `/api/v1/messages/read` | `postReadMessage` | `requireAuth, requireWorkspace` | `MessageModelV1` | **MATCH** |
| 91 | `POST` | `/api/v1/messages/template` | `POST` | `/api/v1/messages/template` | `postTemplateMessage` | `requireAuth, requireWorkspace` | `MessageModelV1` | **MATCH** |
| 92 | `POST` | `/api/v1/messages/image` | `POST` | `/api/v1/messages/image` | `postMediaMessage` | `requireAuth, requireWorkspace` | `MessageModelV1` | **MATCH** |
| 93 | `POST` | `/api/v1/messages/video` | `POST` | `/api/v1/messages/video` | `postMediaMessage` | `requireAuth, requireWorkspace` | `MessageModelV1` | **MATCH** |
| 94 | `POST` | `/api/v1/messages/audio` | `POST` | `/api/v1/messages/audio` | `postMediaMessage` | `requireAuth, requireWorkspace` | `MessageModelV1` | **MATCH** |
| 95 | `POST` | `/api/v1/messages/document` | `POST` | `/api/v1/messages/document` | `postMediaMessage` | `requireAuth, requireWorkspace` | `MessageModelV1` | **MATCH** |
| 96 | `POST` | `/api/v1/messages/sticker` | `POST` | `/api/v1/messages/sticker` | `postMediaMessage` | `requireAuth, requireWorkspace` | `MessageModelV1` | **MATCH** |
| 97 | `POST` | `/api/v1/messages/location` | `POST` | `/api/v1/messages/location` | `postLocationMessage` | `requireAuth, requireWorkspace` | `MessageModelV1` | **MATCH** |
| 98 | `POST` | `/api/v1/messages/contact` | `POST` | `/api/v1/messages/contact` | `postContactMessage` | `requireAuth, requireWorkspace` | `MessageModelV1` | **MATCH** |
| 99 | `POST` | `/api/v1/messages/button` | `POST` | `/api/v1/messages/button` | `postButtonMessage` | `requireAuth, requireWorkspace` | `MessageModelV1` | **MATCH** |
| 100 | `POST` | `/api/v1/messages/list` | `POST` | `/api/v1/messages/list` | `postListMessage` | `requireAuth, requireWorkspace` | `MessageModelV1` | **MATCH** |
| 101 | `POST` | `/api/v1/messages/reaction` | `POST` | `/api/v1/messages/reaction` | `postReactionMessage` | `requireAuth, requireWorkspace` | `MessageModelV1` | **MATCH** |
| 102 | `POST` | `/api/v1/messages/cta-url` | `POST` | `/api/v1/messages/cta-url` | `postCtaUrlMessage` | `requireAuth, requireWorkspace` | `MessageModelV1` | **MATCH** |
| 103 | `POST` | `/api/v1/messages/location-request` | `POST` | `/api/v1/messages/location-request` | `postLocationRequestMessage` | `requireAuth, requireWorkspace` | `MessageModelV1` | **MATCH** |
| 104 | `POST` | `/api/v1/messages/typing-indicator` | `POST` | `/api/v1/messages/typing-indicator` | `postTypingIndicator` | `requireAuth, requireWorkspace` | `MessageModelV1` | **MATCH** |
| 105 | `GET` | `/api/v1/contacts/:contactId/notes` | `GET` | `/api/v1/contacts/:contactId/notes` | `getContactNotesV1` | `requireAuth, requireWorkspace` | `NoteModelV1` | **MATCH** |
| 106 | `POST` | `/api/v1/contacts/:contactId/notes` | `POST` | `/api/v1/contacts/:contactId/notes` | `postContactNoteV1` | `requireAuth, requireWorkspace` | `NoteModelV1` | **MATCH** |
| 107 | `PATCH` | `/api/v1/notes/:noteId` | `PATCH` | `/api/v1/notes/:id` | `patchNoteV1` | `requireAuth, requireWorkspace` | `NoteModelV1` | **MATCH** |
| 108 | `DELETE` | `/api/v1/notes/:noteId` | `DELETE` | `/api/v1/notes/:id` | `deleteNoteRouteV1` | `requireAuth, requireWorkspace` | `NoteModelV1` | **MATCH** |
| 109 | `POST` | `/api/v1/notes/:noteId/pin` | `POST` | `/api/v1/notes/:id/pin` | `postNotePinV1` | `requireAuth, requireWorkspace` | `NoteModelV1` | **MATCH** |
| 110 | `POST` | `/api/v1/notes/:noteId/unpin` | `POST` | `/api/v1/notes/:id/unpin` | `postNoteUnpinV1` | `requireAuth, requireWorkspace` | `NoteModelV1` | **MATCH** |
| 111 | `GET` | `/api/v1/quick-replies` | `GET` | `/api/v1/quick-replies` | `getQuickRepliesV1` | `requireAuth, requireWorkspace` | `QuickReplyModelV1` | **MATCH** |
| 112 | `POST` | `/api/v1/quick-replies` | `POST` | `/api/v1/quick-replies` | `postQuickReplyV1` | `requireAuth, requireWorkspace` | `QuickReplyModelV1` | **MATCH** |
| 113 | `PATCH` | `/api/v1/quick-replies/:quickReplyId` | `PATCH` | `/api/v1/quick-replies/:id` | `patchQuickReplyV1` | `requireAuth, requireWorkspace` | `QuickReplyModelV1` | **MATCH** |
| 114 | `GET` | `/api/v1/quotas` | `GET` | `/api/v1/quotas` | `asyncHandler` | `requireAuth, requireWorkspace` | `DailyQuotaModel` | **MATCH** |
| 115 | `GET` | `/api/v1/quotas/forecast` | `GET` | `/api/v1/quotas/forecast` | `asyncHandler` | `requireAuth, requireWorkspace` | `DailyQuotaModel` | **MATCH** |
| 116 | `GET` | `/api/v1/scheduled-messages` | `GET` | `/api/v1/scheduled-messages` | `getScheduledMessagesV1` | `requireAuth, requireWorkspace` | `ScheduledMessageModelV1` | **MATCH** |
| 117 | `POST` | `/api/v1/scheduled-messages` | `POST` | `/api/v1/scheduled-messages` | `postScheduledMessageV1` | `requireAuth, requireWorkspace` | `ScheduledMessageModelV1` | **MATCH** |
| 118 | `PATCH` | `/api/v1/scheduled-messages/:scheduledMessageId` | `PATCH` | `/api/v1/scheduled-messages/:id` | `patchScheduledMessageV1` | `requireAuth, requireWorkspace` | `ScheduledMessageModelV1` | **MATCH** |
| 119 | `POST` | `/api/v1/scheduled-messages/:scheduledMessageId/cancel` | `POST` | `/api/v1/scheduled-messages/:id/cancel` | `postScheduledMessageCancelV1` | `requireAuth, requireWorkspace` | `ScheduledMessageModelV1` | **MATCH** |
| 120 | `POST` | `/api/v1/scheduled-messages/:scheduledMessageId/pause` | `POST` | `/api/v1/scheduled-messages/:id/pause` | `postScheduledMessagePauseV1` | `requireAuth, requireWorkspace` | `ScheduledMessageModelV1` | **MATCH** |
| 121 | `POST` | `/api/v1/scheduled-messages/:scheduledMessageId/resume` | `POST` | `/api/v1/scheduled-messages/:id/resume` | `postScheduledMessageResumeV1` | `requireAuth, requireWorkspace` | `ScheduledMessageModelV1` | **MATCH** |
| 122 | `POST` | `/api/v1/scheduled-messages/:scheduledMessageId/retry` | `POST` | `/api/v1/scheduled-messages/:id/retry` | `postScheduledMessageRetryV1` | `requireAuth, requireWorkspace` | `ScheduledMessageModelV1` | **MATCH** |
| 123 | `GET` | `/api/v1/search` | `GET` | `/api/v1/search` | `getGlobalSearchV1` | `requireAuth, requireWorkspace` | `Multi-Model Search` | **MATCH** |
| 124 | `GET` | `/api/v1/search/inbox` | `GET` | `/api/v1/search/inbox` | `getInboxSearchV1` | `requireAuth, requireWorkspace` | `ConversationModelV1` | **MATCH** |
| 125 | `GET` | `/api/v1/dashboard` | `GET` | `/api/v1/dashboard` | `getDashboardV1` | `requireAuth, requireWorkspace` | `Multi-Model Aggregation` | **MATCH** |
| 126 | `GET` | `/api/v1/settings` | `GET` | `/api/v1/settings` | `getSettings` | `requireAuth, requireWorkspace` | `SettingsModel` | **MATCH** |
| 127 | `PUT` | `/api/v1/settings` | `PUT` | `/api/v1/settings` | `updateSettings` | `requireAuth, requireWorkspace` | `SettingsModel` | **MATCH** |
| 128 | `POST` | `/api/v1/settings/test-connection` | `POST` | `/api/v1/settings/test-connection` | `testConnection` | `requireAuth, requireWorkspace` | `Meta Client` | **MATCH** |
| 129 | `GET` | `/api/v1/tasks` | `GET` | `/api/v1/tasks` | `getTasksV1` | `requireAuth, requireWorkspace` | `TaskModelV1` | **MATCH** |
| 130 | `POST` | `/api/v1/tasks` | `POST` | `/api/v1/tasks` | `postTaskV1` | `requireAuth, requireWorkspace` | `TaskModelV1` | **MATCH** |
| 131 | `POST` | `/api/v1/tasks/:taskId/complete` | `POST` | `/api/v1/tasks/:id/complete` | `postTaskCompleteV1` | `requireAuth, requireWorkspace` | `TaskModelV1` | **MATCH** |
| 132 | `POST` | `/api/v1/tasks/:taskId/cancel` | `POST` | `/api/v1/tasks/:id/cancel` | `postTaskCancelV1` | `requireAuth, requireWorkspace` | `TaskModelV1` | **MATCH** |
| 133 | `PATCH` | `/api/v1/tasks/:taskId` | `PATCH` | `/api/v1/tasks/:id` | `patchTaskV1` | `requireAuth, requireWorkspace` | `TaskModelV1` | **MATCH** |
| 134 | `GET` | `/api/v1/templates` | `GET` | `/api/v1/templates` | `getTemplates` | `requireAuth, requireWorkspace` | `TemplateModel` | **MATCH** |
| 135 | `POST` | `/api/v1/templates/sync` | `POST` | `/api/v1/templates/sync` | `syncTemplates` | `requireAuth, requireWorkspace` | `TemplateModel` | **MATCH** |
| 136 | `GET` | `/api/v1/webhooks` | `GET` | `/api/v1/webhooks` | `getWebhookOverview` | `requireAuth, requireWorkspace` | `WebhookLogModel` | **MATCH** |
| 137 | `POST` | `/api/v1/webhooks/test` | `POST` | `/api/v1/webhooks/test` | `testWebhook` | `requireAuth, requireWorkspace, webhookTestRateLimit` | `WebhookLogModel` | **MATCH** |
| 138 | `POST` | `/api/v1/webhooks/reconcile` | `POST` | `/api/v1/webhooks/reconcile` | `reconcileWebhookSubscription` | `requireAuth, requireWorkspace` | `WebhookSubscription` | **MATCH** |
| 139 | `GET` | `/api/v1/whatsapp/connections` | `GET` | `/api/v1/whatsapp/connections` | `getConnectionsHandler` | `requireAuth, requireWorkspace` | `WhatsAppConnectionModel` | **MATCH** |
| 140 | `POST` | `/api/v1/whatsapp/connections/:connectionId/sync` | `POST` | `/api/v1/whatsapp/connections/:id/sync` | `syncConnectionHandler` | `requireAuth, requireWorkspace` | `WhatsAppConnectionModel` | **MATCH** |
| 141 | `POST` | `/api/v1/whatsapp/connections/:connectionId/health` | `POST` | `/api/v1/whatsapp/connections/:id/health` | `checkHealthHandler` | `requireAuth, requireWorkspace` | `WhatsAppConnectionModel` | **MATCH** |
| 142 | `DELETE` | `/api/v1/whatsapp/connections/:connectionId` | `DELETE` | `/api/v1/whatsapp/connections/:id` | `disconnectConnectionHandler` | `requireAuth, requireWorkspace` | `WhatsAppConnectionModel` | **MATCH** |
| 143 | `POST` | `/api/v1/whatsapp/connections/embedded-signup/complete` | `POST` | `/api/v1/whatsapp/connections/embedded-signup/complete` | `completeEmbeddedSignupHandler` | `requireAuth, requireWorkspace` | `WhatsAppConnectionModel` | **MATCH** |
| 144 | `WS` | `/socket.io` | `WS` | `/socket.io` | `setupSocketServer` | `Socket.IO Handshake Auth` | `Realtime Publisher` | **MATCH** |
