# NIWA BACKEND — LEGACY API REMOVAL ANALYSIS

## Removal Safety Matrix

Analysis of whether backend legacy compatibility routers mounted in `src/routes/index.ts` can be safely removed.

| Legacy Route | V1 Equivalent | Frontend Uses? | Other Internal Uses? | External Dependency? | Safe To Remove? | Evidence & Rationale |
|---|---|---|---|---|---|---|
| `/api/ai-agent` | `/api/v1/ai-agent` | **No** | No | No | **YES** | Frontend uses `/api/v1/ai-agent`. Unreferenced in production. |
| `/api/auth` | `/api/v1/auth` | **No** | No | No | **YES** | Frontend uses `/api/v1/auth`. Unreferenced. |
| `/api/conversations` | `/api/v1/conversations` | **No** | No | No | **YES** | Frontend uses `/api/v1/conversations`. Unreferenced. |
| `/api/dashboard` | `/api/v1/dashboard` | **No** | No | No | **YES** | Frontend uses `/api/v1/dashboard`. Unreferenced. |
| `/api/logs` | `/api/v1/logs` | **No** | No | No | **YES** | Frontend uses `/api/v1/logs`. Unreferenced. |
| `/api/media` | `/api/v1/media` | **No** | No | No | **YES** | Frontend uses `/api/v1/media`. Unreferenced. |
| `/api/messages` | `/api/v1/messages` | **No** | No | No | **YES** | Frontend uses `/api/v1/messages`. Unreferenced. |
| `/api/settings` | `/api/v1/settings` | **No** | No | No | **YES** | Frontend uses `/api/v1/settings`. Unreferenced. |
| `/api/templates` | `/api/v1/templates` | **No** | No | No | **YES** | Frontend uses `/api/v1/templates`. Unreferenced. |
| `/api/webhooks` | `/api/v1/webhooks` | **No** | No | No | **YES** | Frontend uses `/api/v1/webhooks`. Unreferenced. |
| `/api/whatsapp/connections` | `/api/v1/whatsapp/connections` | **No** | No | No | **YES** | Frontend uses `/api/v1/whatsapp/connections`. Unreferenced. |
| `/webhook/meta` | N/A | **No** | No | **YES (Meta WABA)** | **NO** | Required for Meta Cloud API Webhook handshake & event delivery. |

---

## Summary of Removal Recommendations

- **Safe To Delete**: 11 legacy router mounts in `src/routes/index.ts` (`/api/auth`, `/api/conversations`, etc.).
- **MUST Retain**: `/webhook/meta` (External Meta Cloud API callback endpoint).
