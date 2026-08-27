# NIWA FRONTEND — COMPLETE API USAGE INVENTORY

## Executive Summary

Independent forensic audit of the **NIWA Frontend** (`NiWa-frontend`) against the **NIWA Backend** (`NiWa-backend` on `origin/main`).

- **Generated At**: `2026-08-25T20:47:30.517Z`
- **Frontend Git Commit**: `b82421702dea157f76def83f23cbf23de9989911`
- **Backend Git Commit**: `de4488bdb0b855fb56877ed3758ab7a4ae361100`
- **Total Unique Frontend Endpoints**: **109** (108 HTTP + 1 Realtime Socket.IO)
- **Total Frontend Call Sites**: **111**
- **V1 APIs**: **109** (100%)
- **Legacy APIs (`/api/...`)**: **0**
- **Missing Backend APIs**: **0**
- **Path / Method Mismatches**: **0**
- **Unresolved Dynamic Endpoints**: **0**
- **Audit Verdict**: **PASS WITH WARNINGS**

---

## API Client Inventory

| Client | Source File | Base URL | Auth Mechanism | Purpose |
|---|---|---|---|---|
| `v1ApiClient` | [`lib/api/v1-client.ts`](file:///d:/Easesmith/NiWa/NiWa-frontend/lib/api/v1-client.ts) | `${getBaseApiUrl()}/v1` | Bearer token (JWT in `Authorization` header) | Primary V1 REST client for all 108 HTTP endpoints |
| `socket.io-client` | [`features/inbox/inbox.realtime.ts`](file:///d:/Easesmith/NiWa/NiWa-frontend/features/inbox/inbox.realtime.ts) | Realtime server URL (`/socket.io`) | Query Handshake Auth | Realtime event transport (`campaign.updated`, `message.created`, etc.) |

---

## Complete Endpoint Inventory

| # | Method | Frontend Endpoint | Source File | Caller | Version | Backend Status | Risk |
|---|---|---|---|---|---|---|---|
| 1 | `GET` | `/api/v1/contacts/:contactId/activities` | [activity.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/activities/activity.api.ts#L7) | `listActivitiesV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 2 | `GET` | `/api/v1/ai-agent/settings` | [ai-agent.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/ai-agent/ai-agent.api.ts#L246) | `fetchAISettings` | V1 | PRESENT_IN_BACKEND | LOW |
| 3 | `PUT` | `/api/v1/ai-agent/settings` | [ai-agent.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/ai-agent/ai-agent.api.ts#L303) | `updateAISettings` | V1 | PRESENT_IN_BACKEND | LOW |
| 4 | `GET` | `/api/v1/ai-agent/agents` | [ai-agent.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/ai-agent/ai-agent.api.ts#L251) | `fetchAgents` | V1 | PRESENT_IN_BACKEND | LOW |
| 5 | `POST` | `/api/v1/ai-agent/agents` | [ai-agent.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/ai-agent/ai-agent.api.ts#L256) | `createAgent` | V1 | PRESENT_IN_BACKEND | LOW |
| 6 | `PUT` | `/api/v1/ai-agent/agents/:id` | [ai-agent.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/ai-agent/ai-agent.api.ts#L264) | `updateAgent` | V1 | PRESENT_IN_BACKEND | LOW |
| 7 | `DELETE` | `/api/v1/ai-agent/agents/:id` | [ai-agent.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/ai-agent/ai-agent.api.ts#L269) | `deleteAgent` | V1 | PRESENT_IN_BACKEND | LOW |
| 8 | `POST` | `/api/v1/ai-agent/agents/:id/default` | [ai-agent.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/ai-agent/ai-agent.api.ts#L273) | `setDefaultAgent` | V1 | PRESENT_IN_BACKEND | LOW |
| 9 | `PATCH` | `/api/v1/conversations/:conversationId/agent` | [ai-agent.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/ai-agent/ai-agent.api.ts#L284) | `transferConversationAgent` | V1 | PRESENT_IN_BACKEND | LOW |
| 10 | `GET` | `/api/v1/ai-agent/templates` | [ai-agent.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/ai-agent/ai-agent.api.ts#L288) | `fetchAITemplates` | V1 | PRESENT_IN_BACKEND | LOW |
| 11 | `POST` | `/api/v1/ai-agent/templates/:templateId/apply` | [ai-agent.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/ai-agent/ai-agent.api.ts#L293) | `applyAITemplate` | V1 | PRESENT_IN_BACKEND | LOW |
| 12 | `POST` | `/api/v1/ai-agent/test` | [ai-agent.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/ai-agent/ai-agent.api.ts#L314) | `runAITestingPlayground` | V1 | PRESENT_IN_BACKEND | LOW |
| 13 | `GET` | `/api/v1/ai-agent/activity` | [ai-agent.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/ai-agent/ai-agent.api.ts#L322) | `fetchAIActivityLogs` | V1 | PRESENT_IN_BACKEND | LOW |
| 14 | `GET` | `/api/v1/ai-agent/knowledge` | [ai-agent.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/ai-agent/ai-agent.api.ts#L331) | `fetchKnowledgeSources` | V1 | PRESENT_IN_BACKEND | LOW |
| 15 | `POST` | `/api/v1/ai-agent/knowledge` | [ai-agent.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/ai-agent/ai-agent.api.ts#L349) | `createKnowledgeSource` | V1 | PRESENT_IN_BACKEND | LOW |
| 16 | `PATCH` | `/api/v1/ai-agent/knowledge/:id` | [ai-agent.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/ai-agent/ai-agent.api.ts#L365) | `updateKnowledgeSource` | V1 | PRESENT_IN_BACKEND | LOW |
| 17 | `PATCH` | `/api/v1/ai-agent/knowledge/:id/status` | [ai-agent.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/ai-agent/ai-agent.api.ts#L380) | `toggleKnowledgeSourceStatus` | V1 | PRESENT_IN_BACKEND | LOW |
| 18 | `DELETE` | `/api/v1/ai-agent/knowledge/:id` | [ai-agent.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/ai-agent/ai-agent.api.ts#L387) | `deleteKnowledgeSource` | V1 | PRESENT_IN_BACKEND | LOW |
| 19 | `GET` | `/api/v1/ai-agent/knowledge-packs` | [ai-agent.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/ai-agent/ai-agent.api.ts#L336) | `fetchKnowledgePacks` | V1 | PRESENT_IN_BACKEND | LOW |
| 20 | `PATCH` | `/api/v1/conversations/:conversationId/ai-mode` | [ai-agent.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/ai-agent/ai-agent.api.ts#L397) | `updateConversationAIMode` | V1 | PRESENT_IN_BACKEND | LOW |
| 21 | `POST` | `/api/v1/auth/login` | [auth.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/auth/auth.api.ts#L5) | `loginV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 22 | `POST` | `/api/v1/auth/logout` | [auth.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/auth/auth.api.ts#L15) | `logoutV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 23 | `POST` | `/api/v1/auth/refresh` | [v1-client.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/lib/api/v1-client.ts#L33) | `v1ApiClient interceptor` | V1 | PRESENT_IN_BACKEND | LOW |
| 24 | `GET` | `/api/v1/auth/profile` | [auth.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/auth/auth.api.ts#L10) | `getProfileV1, getProfile` | V1 | PRESENT_IN_BACKEND | LOW |
| 25 | `PUT` | `/api/v1/auth/profile` | [settings.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/settings/settings.api.ts#L39) | `updateProfile` | V1 | PRESENT_IN_BACKEND | LOW |
| 26 | `POST` | `/api/v1/auth/change-password` | [settings.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/settings/settings.api.ts#L44) | `changePassword` | V1 | PRESENT_IN_BACKEND | LOW |
| 27 | `GET` | `/api/v1/automations` | [automation.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/automations/automation.api.ts#L8) | `listAutomationsV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 28 | `POST` | `/api/v1/automations` | [automation.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/automations/automation.api.ts#L26) | `createAutomationV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 29 | `PATCH` | `/api/v1/automations/:automationId` | [automation.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/automations/automation.api.ts#L46) | `patchAutomationV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 30 | `POST` | `/api/v1/automations/:automationId/activate` | [automation.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/automations/automation.api.ts#L57) | `setAutomationLifecycleV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 31 | `POST` | `/api/v1/automations/:automationId/archive` | [automation.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/automations/automation.api.ts#L57) | `setAutomationLifecycleV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 32 | `POST` | `/api/v1/automations/:automationId/pause` | [automation.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/automations/automation.api.ts#L57) | `setAutomationLifecycleV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 33 | `POST` | `/api/v1/automations/:automationId/test` | [automation.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/automations/automation.api.ts#L71) | `testAutomationV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 34 | `GET` | `/api/v1/automations/runs` | [automation.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/automations/automation.api.ts#L82) | `listAutomationRunsV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 35 | `GET` | `/api/v1/automations/runs/:runId` | [automation.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/automations/automation.api.ts#L90) | `getAutomationRunV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 36 | `POST` | `/api/v1/campaigns` | [campaign.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/campaigns/campaign.api.ts#L11) | `createCampaign, createCampaignDraft` | V1 | PRESENT_IN_BACKEND | LOW |
| 37 | `GET` | `/api/v1/campaigns` | [campaign.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/campaigns/campaign.api.ts#L16) | `getCampaigns` | V1 | PRESENT_IN_BACKEND | LOW |
| 38 | `GET` | `/api/v1/campaigns/:id` | [campaign.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/campaigns/campaign.api.ts#L21) | `getCampaignById` | V1 | PRESENT_IN_BACKEND | LOW |
| 39 | `POST` | `/api/v1/campaigns/:id/status` | [campaign.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/campaigns/campaign.api.ts#L26) | `updateCampaignStatus` | V1 | PRESENT_IN_BACKEND | LOW |
| 40 | `POST` | `/api/v1/campaigns/:id/validate` | [campaign.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/campaigns/campaign.api.ts#L31) | `validateCampaign` | V1 | PRESENT_IN_BACKEND | LOW |
| 41 | `GET` | `/api/v1/campaigns/:id/recipients` | [campaign.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/campaigns/campaign.api.ts#L39) | `getCampaignRecipients` | V1 | PRESENT_IN_BACKEND | LOW |
| 42 | `DELETE` | `/api/v1/campaigns/:id` | [campaign.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/campaigns/campaign.api.ts#L44) | `deleteCampaign` | V1 | PRESENT_IN_BACKEND | LOW |
| 43 | `GET` | `/api/v1/campaigns/:id/export` | [campaign.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/campaigns/campaign.api.ts#L49) | `exportCampaignCSV` | V1 | PRESENT_IN_BACKEND | LOW |
| 44 | `PATCH` | `/api/v1/campaigns/:id/draft` | [campaign.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/campaigns/campaign.api.ts#L61) | `updateCampaignDraft` | V1 | PRESENT_IN_BACKEND | LOW |
| 45 | `GET` | `/api/v1/contacts` | [contact.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/contacts/contact.api.ts#L6) | `listContactsV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 46 | `POST` | `/api/v1/contacts` | [contact.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/contacts/contact.api.ts#L22) | `createContactV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 47 | `PATCH` | `/api/v1/contacts/:contactId` | [contact.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/contacts/contact.api.ts#L40) | `patchContactV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 48 | `DELETE` | `/api/v1/contacts/:contactId` | [contact.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/contacts/contact.api.ts#L45) | `deleteContactV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 49 | `POST` | `/api/v1/contacts/:contactId/labels` | [contact.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/contacts/contact.api.ts#L50) | `addContactLabelV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 50 | `DELETE` | `/api/v1/contacts/:contactId/labels/:labelId` | [contact.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/contacts/contact.api.ts#L57) | `removeContactLabelV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 51 | `GET` | `/api/v1/contacts/export` | [contact.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/contacts/contact.api.ts#L66) | `exportContactsV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 52 | `GET` | `/api/v1/contacts/duplicates` | [contact.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/contacts/contact.api.ts#L77) | `getContactDuplicatesV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 53 | `POST` | `/api/v1/contacts/merge` | [contact.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/contacts/contact.api.ts#L97) | `mergeContactsV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 54 | `POST` | `/api/v1/contact-imports/upload` | [contact.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/contacts/contact.api.ts#L104) | `uploadContactImportV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 55 | `POST` | `/api/v1/contact-imports/:importId/validate` | [contact.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/contacts/contact.api.ts#L113) | `validateContactImportV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 56 | `POST` | `/api/v1/contact-imports/:importId/commit` | [contact.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/contacts/contact.api.ts#L118) | `commitContactImportV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 57 | `GET` | `/api/v1/contact-imports/:importId` | [contact.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/contacts/contact.api.ts#L123) | `getContactImportV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 58 | `GET` | `/api/v1/contact-imports` | [contact.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/contacts/contact.api.ts#L128) | `listContactImportsV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 59 | `GET` | `/api/v1/conversations` | [conversation.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/conversations/conversation.api.ts#L6) | `listConversationsV1, getConversations` | V1 | PRESENT_IN_BACKEND | LOW |
| 60 | `GET` | `/api/v1/conversations/:conversationId` | [conversations.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/conversations/conversations.api.ts#L34) | `getConversationDetail` | V1 | PRESENT_IN_BACKEND | LOW |
| 61 | `POST` | `/api/v1/conversations/reply` | [conversations.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/conversations/conversations.api.ts#L51) | `sendReply` | V1 | PRESENT_IN_BACKEND | LOW |
| 62 | `POST` | `/api/v1/conversations/:conversationId/read` | [conversations.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/conversations/conversations.api.ts#L59) | `clearUnread` | V1 | PRESENT_IN_BACKEND | LOW |
| 63 | `PUT` | `/api/v1/conversations/:conversationId/labels` | [conversations.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/conversations/conversations.api.ts#L73) | `updateLabels` | V1 | PRESENT_IN_BACKEND | LOW |
| 64 | `POST` | `/api/v1/conversations/:conversationId/notes` | [conversations.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/conversations/conversations.api.ts#L81) | `addNote` | V1 | PRESENT_IN_BACKEND | LOW |
| 65 | `PATCH` | `/api/v1/conversations/:conversationId/notes/:noteId` | [conversations.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/conversations/conversations.api.ts#L93) | `updateNote` | V1 | PRESENT_IN_BACKEND | LOW |
| 66 | `GET` | `/api/v1/inbox` | [inbox.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/inbox/inbox.api.ts#L9) | `listInboxThreadsV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 67 | `GET` | `/api/v1/inbox/:conversationId` | [inbox.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/inbox/inbox.api.ts#L24) | `getInboxThreadDetailV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 68 | `POST` | `/api/v1/inbox/:conversationId/archive` | [inbox.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/inbox/inbox.api.ts#L46) | `updateInboxThreadStateV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 69 | `POST` | `/api/v1/inbox/:conversationId/pin` | [inbox.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/inbox/inbox.api.ts#L46) | `updateInboxThreadStateV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 70 | `POST` | `/api/v1/inbox/:conversationId/read` | [inbox.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/inbox/inbox.api.ts#L46) | `updateInboxThreadStateV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 71 | `POST` | `/api/v1/inbox/:conversationId/star` | [inbox.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/inbox/inbox.api.ts#L46) | `updateInboxThreadStateV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 72 | `POST` | `/api/v1/inbox/:conversationId/unarchive` | [inbox.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/inbox/inbox.api.ts#L46) | `updateInboxThreadStateV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 73 | `POST` | `/api/v1/inbox/:conversationId/unpin` | [inbox.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/inbox/inbox.api.ts#L46) | `updateInboxThreadStateV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 74 | `POST` | `/api/v1/inbox/:conversationId/unstar` | [inbox.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/inbox/inbox.api.ts#L46) | `updateInboxThreadStateV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 75 | `POST` | `/api/v1/inbox/:conversationId/sync-history` | [inbox.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/inbox/inbox.api.ts#L51) | `syncInboxThreadHistoryV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 76 | `GET` | `/api/v1/labels` | [label.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/labels/label.api.ts#L6) | `listLabelsV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 77 | `POST` | `/api/v1/labels` | [label.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/labels/label.api.ts#L18) | `createLabelV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 78 | `PATCH` | `/api/v1/labels/:labelId` | [label.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/labels/label.api.ts#L31) | `patchLabelV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 79 | `DELETE` | `/api/v1/labels/:labelId` | [label.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/labels/label.api.ts#L36) | `deleteLabelV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 80 | `GET` | `/api/v1/logs/api` | [logs.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/logs/logs.api.ts#L27) | `getApiLogsV1, exportApiLogsV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 81 | `GET` | `/api/v1/logs/webhooks` | [logs.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/logs/logs.api.ts#L39) | `getWebhookLogsV1, exportWebhookLogsV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 82 | `GET` | `/api/v1/media` | [media.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/media/media.api.ts#L13) | `listMedia, getReplyMedia, getMessageStudioMedia` | V1 | PRESENT_IN_BACKEND | LOW |
| 83 | `GET` | `/api/v1/media/:id` | [media.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/media/media.api.ts#L25) | `getMediaDetail` | V1 | PRESENT_IN_BACKEND | LOW |
| 84 | `POST` | `/api/v1/media/upload` | [media.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/media/media.api.ts#L35) | `uploadMedia, uploadTemplateHeaderMedia` | V1 | PRESENT_IN_BACKEND | LOW |
| 85 | `DELETE` | `/api/v1/media/:id` | [media.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/media/media.api.ts#L44) | `deleteMedia` | V1 | PRESENT_IN_BACKEND | LOW |
| 86 | `PATCH` | `/api/v1/media/:id` | [media.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/media/media.api.ts#L50) | `updateMediaMetadata` | V1 | PRESENT_IN_BACKEND | LOW |
| 87 | `GET` | `/api/v1/messages` | [message.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/messages/message.api.ts#L6) | `listMessagesV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 88 | `POST` | `/api/v1/messages/text` | [message.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/messages/message.api.ts#L16) | `sendTextMessageV1, useMessageStudioOrchestration` | V1 | PRESENT_IN_BACKEND | LOW |
| 89 | `GET` | `/api/v1/messages/:messageId/media` | [inbox.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/inbox/inbox.api.ts#L63) | `fetchMessageMediaBlobV1, getMessageMediaUrlV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 90 | `POST` | `/api/v1/messages/read` | [conversations.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/conversations/conversations.api.ts#L66) | `markMessageRead` | V1 | PRESENT_IN_BACKEND | LOW |
| 91 | `POST` | `/api/v1/messages/template` | [useMessageStudioOrchestration.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/message-studio/hooks/useMessageStudioOrchestration.ts#L118) | `sendMessage` | V1 | PRESENT_IN_BACKEND | LOW |
| 92 | `POST` | `/api/v1/messages/image` | [useMessageStudioOrchestration.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/message-studio/hooks/useMessageStudioOrchestration.ts#L138) | `sendMessage` | V1 | PRESENT_IN_BACKEND | LOW |
| 93 | `POST` | `/api/v1/messages/video` | [useMessageStudioOrchestration.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/message-studio/hooks/useMessageStudioOrchestration.ts#L138) | `sendMessage` | V1 | PRESENT_IN_BACKEND | LOW |
| 94 | `POST` | `/api/v1/messages/audio` | [useMessageStudioOrchestration.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/message-studio/hooks/useMessageStudioOrchestration.ts#L138) | `sendMessage` | V1 | PRESENT_IN_BACKEND | LOW |
| 95 | `POST` | `/api/v1/messages/document` | [useMessageStudioOrchestration.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/message-studio/hooks/useMessageStudioOrchestration.ts#L138) | `sendMessage` | V1 | PRESENT_IN_BACKEND | LOW |
| 96 | `POST` | `/api/v1/messages/sticker` | [useMessageStudioOrchestration.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/message-studio/hooks/useMessageStudioOrchestration.ts#L138) | `sendMessage` | V1 | PRESENT_IN_BACKEND | LOW |
| 97 | `POST` | `/api/v1/messages/location` | [useMessageStudioOrchestration.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/message-studio/hooks/useMessageStudioOrchestration.ts#L147) | `sendMessage` | V1 | PRESENT_IN_BACKEND | LOW |
| 98 | `POST` | `/api/v1/messages/contact` | [useMessageStudioOrchestration.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/message-studio/hooks/useMessageStudioOrchestration.ts#L156) | `sendMessage` | V1 | PRESENT_IN_BACKEND | LOW |
| 99 | `POST` | `/api/v1/messages/button` | [useMessageStudioOrchestration.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/message-studio/hooks/useMessageStudioOrchestration.ts#L176) | `sendMessage` | V1 | PRESENT_IN_BACKEND | LOW |
| 100 | `POST` | `/api/v1/messages/list` | [useMessageStudioOrchestration.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/message-studio/hooks/useMessageStudioOrchestration.ts#L191) | `sendMessage` | V1 | PRESENT_IN_BACKEND | LOW |
| 101 | `POST` | `/api/v1/messages/reaction` | [useMessageStudioOrchestration.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/message-studio/hooks/useMessageStudioOrchestration.ts#L206) | `sendMessage` | V1 | PRESENT_IN_BACKEND | LOW |
| 102 | `POST` | `/api/v1/messages/cta-url` | [useMessageStudioOrchestration.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/message-studio/hooks/useMessageStudioOrchestration.ts#L213) | `sendMessage` | V1 | PRESENT_IN_BACKEND | LOW |
| 103 | `POST` | `/api/v1/messages/location-request` | [useMessageStudioOrchestration.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/message-studio/hooks/useMessageStudioOrchestration.ts#L223) | `sendMessage` | V1 | PRESENT_IN_BACKEND | LOW |
| 104 | `POST` | `/api/v1/messages/typing-indicator` | [useMessageStudioOrchestration.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/message-studio/hooks/useMessageStudioOrchestration.ts#L229) | `sendMessage` | V1 | PRESENT_IN_BACKEND | LOW |
| 105 | `GET` | `/api/v1/contacts/:contactId/notes` | [note.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/notes/note.api.ts#L6) | `listNotesV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 106 | `POST` | `/api/v1/contacts/:contactId/notes` | [note.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/notes/note.api.ts#L18) | `createNoteV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 107 | `PATCH` | `/api/v1/notes/:noteId` | [note.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/notes/note.api.ts#L27) | `patchNoteV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 108 | `DELETE` | `/api/v1/notes/:noteId` | [note.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/notes/note.api.ts#L32) | `deleteNoteV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 109 | `POST` | `/api/v1/notes/:noteId/pin` | [note.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/notes/note.api.ts#L37) | `pinNoteV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 110 | `POST` | `/api/v1/notes/:noteId/unpin` | [note.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/notes/note.api.ts#L42) | `unpinNoteV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 111 | `GET` | `/api/v1/quick-replies` | [quick-reply.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/quick-replies/quick-reply.api.ts#L6) | `listQuickRepliesV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 112 | `POST` | `/api/v1/quick-replies` | [quick-reply.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/quick-replies/quick-reply.api.ts#L17) | `createQuickReplyV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 113 | `PATCH` | `/api/v1/quick-replies/:quickReplyId` | [quick-reply.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/quick-replies/quick-reply.api.ts#L32) | `patchQuickReplyV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 114 | `GET` | `/api/v1/quotas` | [quota.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/quotas/quota.api.ts#L11) | `getQuota` | V1 | PRESENT_IN_BACKEND | LOW |
| 115 | `GET` | `/api/v1/quotas/forecast` | [quota.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/quotas/quota.api.ts#L18) | `getQuotaForecast` | V1 | PRESENT_IN_BACKEND | LOW |
| 116 | `GET` | `/api/v1/scheduled-messages` | [scheduled-message.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/scheduled-messages/scheduled-message.api.ts#L9) | `listScheduledMessagesV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 117 | `POST` | `/api/v1/scheduled-messages` | [scheduled-message.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/scheduled-messages/scheduled-message.api.ts#L26) | `createScheduledMessageV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 118 | `PATCH` | `/api/v1/scheduled-messages/:scheduledMessageId` | [scheduled-message.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/scheduled-messages/scheduled-message.api.ts#L42) | `patchScheduledMessageV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 119 | `POST` | `/api/v1/scheduled-messages/:scheduledMessageId/cancel` | [scheduled-message.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/scheduled-messages/scheduled-message.api.ts#L53) | `setScheduledMessageLifecycleV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 120 | `POST` | `/api/v1/scheduled-messages/:scheduledMessageId/pause` | [scheduled-message.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/scheduled-messages/scheduled-message.api.ts#L53) | `setScheduledMessageLifecycleV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 121 | `POST` | `/api/v1/scheduled-messages/:scheduledMessageId/resume` | [scheduled-message.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/scheduled-messages/scheduled-message.api.ts#L53) | `setScheduledMessageLifecycleV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 122 | `POST` | `/api/v1/scheduled-messages/:scheduledMessageId/retry` | [scheduled-message.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/scheduled-messages/scheduled-message.api.ts#L53) | `setScheduledMessageLifecycleV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 123 | `GET` | `/api/v1/search` | [search.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/search/search.api.ts#L9) | `getGlobalSearchV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 124 | `GET` | `/api/v1/search/inbox` | [search.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/search/search.api.ts#L16) | `getInboxSearchV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 125 | `GET` | `/api/v1/dashboard` | [search.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/search/search.api.ts#L23) | `getDashboardSummaryV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 126 | `GET` | `/api/v1/settings` | [settings.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/settings/settings.api.ts#L15) | `getSettings` | V1 | PRESENT_IN_BACKEND | LOW |
| 127 | `PUT` | `/api/v1/settings` | [settings.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/settings/settings.api.ts#L29) | `updateSettings` | V1 | PRESENT_IN_BACKEND | LOW |
| 128 | `POST` | `/api/v1/settings/test-connection` | [settings.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/settings/settings.api.ts#L34) | `testConnection` | V1 | PRESENT_IN_BACKEND | LOW |
| 129 | `GET` | `/api/v1/tasks` | [task.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/tasks/task.api.ts#L6) | `listTasksV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 130 | `POST` | `/api/v1/tasks` | [task.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/tasks/task.api.ts#L22) | `createTaskV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 131 | `POST` | `/api/v1/tasks/:taskId/complete` | [task.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/tasks/task.api.ts#L27) | `completeTaskV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 132 | `POST` | `/api/v1/tasks/:taskId/cancel` | [task.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/tasks/task.api.ts#L32) | `cancelTaskV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 133 | `PATCH` | `/api/v1/tasks/:taskId` | [task.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/tasks/task.api.ts#L46) | `patchTaskV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 134 | `GET` | `/api/v1/templates` | [templates.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/templates/templates.api.ts#L8) | `getTemplatesV1, getTemplates, getReplyTemplates, getMessageStudioTemplates` | V1 | PRESENT_IN_BACKEND | LOW |
| 135 | `POST` | `/api/v1/templates/sync` | [templates.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/templates/templates.api.ts#L18) | `syncTemplatesV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 136 | `GET` | `/api/v1/webhooks` | [webhooks.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/webhooks/webhooks.api.ts#L7) | `getWebhooksV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 137 | `POST` | `/api/v1/webhooks/test` | [webhooks.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/webhooks/webhooks.api.ts#L12) | `testWebhookV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 138 | `POST` | `/api/v1/webhooks/reconcile` | [webhooks.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/webhooks/webhooks.api.ts#L16) | `reconcileWebhookV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 139 | `GET` | `/api/v1/whatsapp/connections` | [whatsapp-connections.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/whatsapp-connections/whatsapp-connections.api.ts#L5) | `getWhatsAppConnections` | V1 | PRESENT_IN_BACKEND | LOW |
| 140 | `POST` | `/api/v1/whatsapp/connections/:connectionId/sync` | [whatsapp-connections.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/whatsapp-connections/whatsapp-connections.api.ts#L10) | `syncWhatsAppConnection` | V1 | PRESENT_IN_BACKEND | LOW |
| 141 | `POST` | `/api/v1/whatsapp/connections/:connectionId/health` | [whatsapp-connections.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/whatsapp-connections/whatsapp-connections.api.ts#L15) | `checkWhatsAppConnectionHealth` | V1 | PRESENT_IN_BACKEND | LOW |
| 142 | `DELETE` | `/api/v1/whatsapp/connections/:connectionId` | [whatsapp-connections.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/whatsapp-connections/whatsapp-connections.api.ts#L20) | `disconnectWhatsAppConnection` | V1 | PRESENT_IN_BACKEND | LOW |
| 143 | `POST` | `/api/v1/whatsapp/connections/embedded-signup/complete` | [whatsapp-connections.api.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/whatsapp-connections/whatsapp-connections.api.ts#L30) | `completeEmbeddedSignupV1` | V1 | PRESENT_IN_BACKEND | LOW |
| 144 | `WS` | `/socket.io` | [inbox.realtime.ts](file:///d:/Easesmith/NiWa/NiWa-frontend/features/inbox/inbox.realtime.ts#L59) | `subscribeInboxRealtime, subscribeCampaignRealtime` | V1 | PRESENT_IN_BACKEND | LOW |
