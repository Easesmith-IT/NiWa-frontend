# NIWA FRONTEND — LEGACY API DEPENDENCIES & MIGRATION FORENSIC AUDIT

## Executive Classification

Every frontend API invocation site was classified into standard forensic buckets:

- **V1 (Canonical)**: 109 Endpoints (100%)
- **LEGACY (Direct `/api/...`)**: 0 Endpoints
- **UNKNOWN**: 0 Endpoints
- **NEEDS REVIEW**: 0 Endpoints

---

## Forensic Investigation Findings

1. **Direct `/api/...` calls without `/v1`**: **0**
   - All REST requests use `v1ApiClient` which prepends `/v1` automatically.
2. **Indirect legacy calls through helper functions**: **0**
   - All helper functions in `features/*/*.api.ts` route through `v1ApiClient`.
3. **Legacy API aliases hidden behind wrappers**: **0**
4. **Calls constructed dynamically that static grep could miss**: **0**
   - Dynamic Message Studio endpoints (`/messages/${composer.mode}`) resolved across all 14 modes.
5. **Frontend dependency on legacy backend endpoints**: **0**
   - Frontend requires no backend legacy aliases.

---

## Legacy Dependency Breakdown Table

| Finding | Path / Expression | Source Site | Classification | Backend Support Status | Migration Action | Risk |
|---|---|---|---|---|---|---|
| Token Refresh Interceptor | `POST /auth/refresh` | `lib/api/v1-client.ts:33` | **V1** | Mounted at `/api/v1/auth/refresh` | None — fully canonical V1 | SAFE |
| Message Studio Dynamic Dispatch | `POST /messages/${composer.mode}` | `useMessageStudioOrchestration.ts:138` | **V1** | Mounted at `/api/v1/messages/*` | None — all 14 modes exist in V1 | SAFE |
| Contact Import Upload | `POST /contact-imports/upload` | `features/contacts/contact.api.ts:104` | **V1** | Mounted at `/api/v1/contact-imports/upload` | None — multipart handled | SAFE |
