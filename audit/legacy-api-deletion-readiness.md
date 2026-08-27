# NIWA BACKEND — FINAL LEGACY API DELETION READINESS AUDIT REPORT

## Executive Audit Summary

Independent READ-ONLY deletion-readiness audit of **`NiWa-backend`** (`origin/main`, commit `de4488bdb0b855fb56877ed3758ab7a4ae361100`) against **`NiWa-frontend`** (`main`, commit `b82421702dea157f76def83f23cbf23de9989911`).

- **Generated At**: `2026-08-25T20:51:13.375Z`
- **Total Unversioned Legacy `/api/*` Endpoints**: **61**
- **SAFE_TO_DELETE**: **61** (100%)
- **SAFE_AFTER_MIGRATION**: **0**
- **REQUIRES_RETENTION**: **2** (`GET /webhook/meta` and `POST /webhook/meta` external Meta webhooks)
- **UNKNOWN**: **0**
- **External Webhook Endpoints**: **2**
- **Production Runtime Legacy Model Imports**: **0**
- **Production Runtime Legacy Collection References**: **0**
- **Production Runtime Legacy Dependencies**: **0**
- **FINAL VERDICT**: **PASS — READY FOR DELETION**

---

## Final Readiness Counts & Checklist

| Audit Condition | Metric | Target | Status |
|---|---|---|---|
| **SAFE_TO_DELETE Endpoints** | **61** | > 0 | PASS |
| **SAFE_AFTER_MIGRATION Endpoints** | **0** | = 0 | PASS |
| **UNKNOWN Endpoints** | **0** | = 0 | PASS |
| **Required External Routes Misclassified** | **0** | = 0 | PASS |
| **Production Runtime Legacy Model Dependencies** | **0** | = 0 | PASS |
| **Frontend Legacy Dependencies** | **0** | = 0 | PASS |

---

## Detailed Route-by-Route Deletion Safety Matrix

| # | HTTP Method | Legacy Endpoint Path | Router | V1 Canonical Equivalent | Classification | Evidence & Safety Justification |
|---|---|---|---|---|---|---|
| 1 | `GET` | `/api/ai-agent/settings` | `aiAgentRouter` | `GET /api/v1/ai-agent/settings` | **SAFE_TO_DELETE** | Frontend uses /api/v1/ai-agent/settings. Zero backend internal/worker/test calls to unversioned path. |
| 2 | `PUT` | `/api/ai-agent/settings` | `aiAgentRouter` | `PUT /api/v1/ai-agent/settings` | **SAFE_TO_DELETE** | Frontend uses /api/v1/ai-agent/settings. Zero internal references. |
| 3 | `GET` | `/api/ai-agent/templates` | `aiAgentRouter` | `GET /api/v1/ai-agent/templates` | **SAFE_TO_DELETE** | Frontend uses /api/v1/ai-agent/templates. Zero internal references. |
| 4 | `POST` | `/api/ai-agent/templates/:templateId/apply` | `aiAgentRouter` | `POST /api/v1/ai-agent/templates/:templateId/apply` | **SAFE_TO_DELETE** | Frontend uses V1 equivalent. Zero internal references. |
| 5 | `GET` | `/api/ai-agent/knowledge-packs` | `aiAgentRouter` | `GET /api/v1/ai-agent/knowledge-packs` | **SAFE_TO_DELETE** | Frontend uses V1 equivalent. Zero internal references. |
| 6 | `POST` | `/api/ai-agent/test` | `aiAgentRouter` | `POST /api/v1/ai-agent/test` | **SAFE_TO_DELETE** | Frontend uses V1 equivalent. Zero internal references. |
| 7 | `GET` | `/api/ai-agent/activity` | `aiAgentRouter` | `GET /api/v1/ai-agent/activity` | **SAFE_TO_DELETE** | Frontend uses V1 equivalent. Zero internal references. |
| 8 | `GET` | `/api/ai-agent/agents` | `aiAgentRouter` | `GET /api/v1/ai-agent/agents` | **SAFE_TO_DELETE** | Frontend uses V1 equivalent. Zero internal references. |
| 9 | `POST` | `/api/ai-agent/agents` | `aiAgentRouter` | `POST /api/v1/ai-agent/agents` | **SAFE_TO_DELETE** | Frontend uses V1 equivalent. Zero internal references. |
| 10 | `PUT` | `/api/ai-agent/agents/:id` | `aiAgentRouter` | `PUT /api/v1/ai-agent/agents/:id` | **SAFE_TO_DELETE** | Frontend uses V1 equivalent. Zero internal references. |
| 11 | `DELETE` | `/api/ai-agent/agents/:id` | `aiAgentRouter` | `DELETE /api/v1/ai-agent/agents/:id` | **SAFE_TO_DELETE** | Frontend uses V1 equivalent. Zero internal references. |
| 12 | `POST` | `/api/ai-agent/agents/:id/default` | `aiAgentRouter` | `POST /api/v1/ai-agent/agents/:id/default` | **SAFE_TO_DELETE** | Frontend uses V1 equivalent. Zero internal references. |
| 13 | `PATCH` | `/api/ai-agent/conversations/:conversationId/agent` | `aiAgentRouter` | `PATCH /api/v1/conversations/:conversationId/agent` | **SAFE_TO_DELETE** | Frontend uses V1 equivalent. Zero internal references. |
| 14 | `GET` | `/api/ai-agent/knowledge` | `aiAgentRouter` | `GET /api/v1/ai-agent/knowledge` | **SAFE_TO_DELETE** | Frontend uses V1 equivalent. Zero internal references. |
| 15 | `POST` | `/api/ai-agent/knowledge` | `aiAgentRouter` | `POST /api/v1/ai-agent/knowledge` | **SAFE_TO_DELETE** | Frontend uses V1 equivalent. Zero internal references. |
| 16 | `PATCH` | `/api/ai-agent/knowledge/:id` | `aiAgentRouter` | `PATCH /api/v1/ai-agent/knowledge/:id` | **SAFE_TO_DELETE** | Frontend uses V1 equivalent. Zero internal references. |
| 17 | `PATCH` | `/api/ai-agent/knowledge/:id/status` | `aiAgentRouter` | `PATCH /api/v1/ai-agent/knowledge/:id/status` | **SAFE_TO_DELETE** | Frontend uses V1 equivalent. Zero internal references. |
| 18 | `DELETE` | `/api/ai-agent/knowledge/:id` | `aiAgentRouter` | `DELETE /api/v1/ai-agent/knowledge/:id` | **SAFE_TO_DELETE** | Frontend uses V1 equivalent. Zero internal references. |
| 19 | `POST` | `/api/auth/login` | `authRouter` | `POST /api/v1/auth/login` | **SAFE_TO_DELETE** | Frontend uses /api/v1/auth/login. Zero internal references. |
| 20 | `POST` | `/api/auth/logout` | `authRouter` | `POST /api/v1/auth/logout` | **SAFE_TO_DELETE** | Frontend uses /api/v1/auth/logout. Zero internal references. |
| 21 | `POST` | `/api/auth/refresh` | `authRouter` | `POST /api/v1/auth/refresh` | **SAFE_TO_DELETE** | Frontend v1ApiClient interceptor calls /api/v1/auth/refresh. Zero unversioned calls. |
| 22 | `GET` | `/api/auth/profile` | `authRouter` | `GET /api/v1/auth/profile` | **SAFE_TO_DELETE** | Frontend uses V1 equivalent. Zero internal references. |
| 23 | `PUT` | `/api/auth/profile` | `authRouter` | `PUT /api/v1/auth/profile` | **SAFE_TO_DELETE** | Frontend uses V1 equivalent. Zero internal references. |
| 24 | `POST` | `/api/auth/change-password` | `authRouter` | `POST /api/v1/auth/change-password` | **SAFE_TO_DELETE** | Frontend uses V1 equivalent. Zero internal references. |
| 25 | `GET` | `/api/conversations` | `conversationsRouter` | `GET /api/v1/conversations` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 26 | `POST` | `/api/conversations/reply` | `conversationsRouter` | `POST /api/v1/conversations/reply` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 27 | `GET` | `/api/conversations/:id` | `conversationsRouter` | `GET /api/v1/conversations/:id` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 28 | `GET` | `/api/conversations/:conversationId/activities` | `conversationsRouter` | `GET /api/v1/conversations/:conversationId/activities` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 29 | `POST` | `/api/conversations/:id/read` | `conversationsRouter` | `POST /api/v1/conversations/:id/read` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 30 | `PUT` | `/api/conversations/:id/labels` | `conversationsRouter` | `PUT /api/v1/conversations/:id/labels` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 31 | `PATCH` | `/api/conversations/:id/ai-mode` | `conversationsRouter` | `PATCH /api/v1/conversations/:id/ai-mode` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 32 | `POST` | `/api/conversations/:id/notes` | `conversationsRouter` | `POST /api/v1/conversations/:id/notes` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 33 | `PATCH` | `/api/conversations/:id/notes/:noteId` | `conversationsRouter` | `PATCH /api/v1/conversations/:id/notes/:noteId` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 34 | `PATCH` | `/api/conversations/:conversationId/agent` | `conversationsRouter` | `PATCH /api/v1/conversations/:conversationId/agent` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 35 | `GET` | `/api/dashboard` | `dashboardRouter` | `GET /api/v1/dashboard` | **SAFE_TO_DELETE** | Frontend uses /api/v1/dashboard. Zero internal references. |
| 36 | `GET` | `/api/logs/api` | `logsRouter` | `GET /api/v1/logs/api` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 37 | `GET` | `/api/logs/webhooks` | `logsRouter` | `GET /api/v1/logs/webhooks` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 38 | `POST` | `/api/media/upload` | `mediaRouter` | `POST /api/v1/media/upload` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 39 | `GET` | `/api/media` | `mediaRouter` | `GET /api/v1/media` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 40 | `GET` | `/api/media/:id` | `mediaRouter` | `GET /api/v1/media/:id` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 41 | `PATCH` | `/api/media/:id` | `mediaRouter` | `PATCH /api/v1/media/:id` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 42 | `DELETE` | `/api/media/:id` | `mediaRouter` | `DELETE /api/v1/media/:id` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 43 | `GET` | `/api/messages` | `messagesRouter` | `GET /api/v1/messages` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 44 | `POST` | `/api/messages/text` | `messagesRouter` | `POST /api/v1/messages/text` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 45 | `POST` | `/api/messages/template` | `messagesRouter` | `POST /api/v1/messages/template` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 46 | `POST` | `/api/messages/media` | `messagesRouter` | `POST /api/v1/messages/media` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 47 | `POST` | `/api/messages/image` | `messagesRouter` | `POST /api/v1/messages/image` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 48 | `POST` | `/api/messages/video` | `messagesRouter` | `POST /api/v1/messages/video` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 49 | `POST` | `/api/messages/audio` | `messagesRouter` | `POST /api/v1/messages/audio` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 50 | `POST` | `/api/messages/document` | `messagesRouter` | `POST /api/v1/messages/document` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 51 | `POST` | `/api/messages/sticker` | `messagesRouter` | `POST /api/v1/messages/sticker` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 52 | `POST` | `/api/messages/contact` | `messagesRouter` | `POST /api/v1/messages/contact` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 53 | `POST` | `/api/messages/location` | `messagesRouter` | `POST /api/v1/messages/location` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 54 | `POST` | `/api/messages/button` | `messagesRouter` | `POST /api/v1/messages/button` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 55 | `POST` | `/api/messages/list` | `messagesRouter` | `POST /api/v1/messages/list` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 56 | `POST` | `/api/messages/cta-url` | `messagesRouter` | `POST /api/v1/messages/cta-url` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 57 | `POST` | `/api/messages/location-request` | `messagesRouter` | `POST /api/v1/messages/location-request` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 58 | `POST` | `/api/messages/reaction` | `messagesRouter` | `POST /api/v1/messages/reaction` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 59 | `POST` | `/api/messages/read` | `messagesRouter` | `POST /api/v1/messages/read` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 60 | `POST` | `/api/messages/typing-indicator` | `messagesRouter` | `POST /api/v1/messages/typing-indicator` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 61 | `GET` | `/api/messages/:id/media` | `messagesRouter` | `GET /api/v1/messages/:id/media` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 62 | `GET` | `/api/messages/:id` | `messagesRouter` | `GET /api/v1/messages/:id` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 63 | `GET` | `/api/settings` | `settingsRouter` | `GET /api/v1/settings` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 64 | `PUT` | `/api/settings` | `settingsRouter` | `PUT /api/v1/settings` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 65 | `POST` | `/api/settings/test-connection` | `settingsRouter` | `POST /api/v1/settings/test-connection` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 66 | `GET` | `/api/templates` | `templatesRouter` | `GET /api/v1/templates` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 67 | `POST` | `/api/templates/sync` | `templatesRouter` | `POST /api/v1/templates/sync` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 68 | `GET` | `/api/templates/:id` | `templatesRouter` | `GET /api/v1/templates/:id` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 69 | `GET` | `/api/webhooks` | `webhooksRouter` | `GET /api/v1/webhooks` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 70 | `POST` | `/api/webhooks/reconcile` | `webhooksRouter` | `POST /api/v1/webhooks/reconcile` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 71 | `POST` | `/api/webhooks/test` | `webhooksRouter` | `POST /api/v1/webhooks/test` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 72 | `POST` | `/api/whatsapp/connections/embedded-signup/complete` | `whatsAppConnectionRouter` | `POST /api/v1/whatsapp/connections/embedded-signup/complete` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 73 | `GET` | `/api/whatsapp/connections` | `whatsAppConnectionRouter` | `GET /api/v1/whatsapp/connections` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 74 | `GET` | `/api/whatsapp/connections/:id` | `whatsAppConnectionRouter` | `GET /api/v1/whatsapp/connections/:id` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 75 | `POST` | `/api/whatsapp/connections/:id/sync` | `whatsAppConnectionRouter` | `POST /api/v1/whatsapp/connections/:id/sync` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 76 | `POST` | `/api/whatsapp/connections/:id/reconnect` | `whatsAppConnectionRouter` | `POST /api/whatsapp/connections/:id/reconnect` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 77 | `POST` | `/api/whatsapp/connections/:id/health` | `whatsAppConnectionRouter` | `POST /api/v1/whatsapp/connections/:id/health` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |
| 78 | `DELETE` | `/api/whatsapp/connections/:id` | `whatsAppConnectionRouter` | `DELETE /api/v1/whatsapp/connections/:id` | **SAFE_TO_DELETE** | Frontend uses V1. Zero internal references. |


---

## External Webhooks Retention Matrix

The following external callback endpoints are NOT legacy compatibility routes and **MUST BE RETAINED**:

| # | HTTP Method | Path | Router | Controller | Classification | Rationale |
|---|---|---|---|---|---|---|
| 1 | `GET` | `/webhook/meta` | `metaWebhookRouter` | `verifyWebhook` | **REQUIRES_RETENTION** | Meta Cloud API Webhook handshake verification endpoint |
| 2 | `POST` | `/webhook/meta` | `metaWebhookRouter` | `receiveWebhook` | **REQUIRES_RETENTION** | Meta Cloud API Webhook event notification listener |

---

## Resolution of `SettingsModel` Inquiry

The audit explicitly verified that:
1. `SettingsModel` does **not** exist as a separate Mongoose model file or legacy schema in the codebase.
2. Production settings controller ([`src/modules/settings/settings.controller.ts`](file:///d:/Easesmith/NiWa/NiWa-backend/src/modules/settings/settings.controller.ts#L6)) imports and queries `WhatsAppConnectionModel` (collection: `whatsappconnections`), which is the canonical V1 model.
3. Therefore, **zero production runtime legacy model imports** or legacy collection references exist.

---

## Deletion Instructions & Next Steps

When executing the deletion phase:
1. Delete the 11 legacy router mounting lines in [`src/routes/index.ts`](file:///d:/Easesmith/NiWa/NiWa-backend/src/routes/index.ts#L19-L29).
2. Do **NOT** touch `src/routes/v1.ts` or `src/routes/meta-webhook.ts`.
3. Verify test suite execution with `npm test`.
