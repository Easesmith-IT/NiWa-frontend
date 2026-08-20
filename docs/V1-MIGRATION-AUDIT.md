# V1 Architecture Audit

## A. Architecture Overview
The NiWa frontend is a Next.js application (App Router) currently in a transitional state between a legacy page-based architecture and a new "V1" feature-based architecture. 

Currently, `app/(app)/` contains the route structure, but many of the pages still contain inline business logic, direct API calls, and local state management instead of delegating to `features/`.

## B. Legacy Architecture Inventory
- **Legacy API Client:** `lib/api/client.ts` is still used in many places (e.g., `app/(app)/conversations/page.tsx`, `app/(app)/message-studio/page.tsx`, `app/(app)/settings/page.tsx`, etc.).
- **Page-Level Business Logic:** Many large `page.tsx` files are monolithic and own their data fetching. 
  - Examples: `app/(app)/ai-agent/page.tsx`, `app/(app)/conversations/page.tsx`, `app/(app)/message-studio/page.tsx`, `app/(app)/settings/page.tsx`.
- **Inline Modal implementations:** Many Modals/Dialogs are implemented with raw DOM techniques (`fixed inset-0`, `z-50`, `createPortal`) directly within the pages or features, instead of a reusable accessible UI primitive.

## C. V1 Architecture Inventory
- **V1 API Client:** `lib/api/v1-client.ts` is introduced and used by most of the newer `features/` directory APIs.
- **Features Folder:** `features/` exists and contains several modules (e.g., `campaigns`, `inbox`, `contacts`, `ai-agent`). Most features have the correct file structure: `*.api.ts`, `*.queries.ts`, `*.types.ts`.
- **Centralized Query Keys (Partial):** `lib/api/v1-query-keys.ts` exists, providing a central place for React Query keys, though it is not fully utilized by all features (e.g., Campaigns uses its own key factory).

## D. Hybrid Areas
- **Campaigns:** Uses `features/campaigns/` extensively, but `app/(app)/campaigns/[id]/page.tsx` imports both `apiClient` and `v1ApiClient`, indicating incomplete migration. `app/(app)/campaigns/new/page.tsx` directly uses queries and API logic.
- **AI Agent:** Has a dedicated `features/ai-agent/` with queries and API, but `app/(app)/ai-agent/page.tsx` is still monolithic and contains inline UI/modal logic.

## E. Large/Monolithic Files
- `app/(app)/ai-agent/page.tsx`
- `app/(app)/campaigns/[id]/page.tsx`
- `app/(app)/conversations/page.tsx`
- `app/(app)/inbox/page.tsx`
- `app/(app)/message-studio/page.tsx`
- `app/(app)/settings/page.tsx`

## F. Modal/Dialog/Drawer Inventory
Inline custom modal implementations (using `fixed inset-0`, `z-50`, `backdrop`) were found in:
- `app/(app)/ai-agent/components/AgentDecisionTrace.tsx`
- `app/(app)/ai-agent/components/AgentInstanceManager.tsx`
- `app/(app)/ai-agent/components/AgentLibrary.tsx`
- `app/(app)/ai-agent/page.tsx`
- `app/(app)/campaigns/[id]/page.tsx`
- `app/(app)/campaigns/page.tsx`
- `app/(app)/contacts/page.tsx`
- `app/(app)/conversations/page.tsx`
- `app/(app)/inbox/page.tsx`
- `app/(app)/message-studio/page.tsx`
- `features/contacts/components/ContactMergeModal.tsx`
- `features/inbox/components/ImageLightboxModal.tsx`

There is a severe lack of centralized UI primitives. `components/ui/` only has `button.tsx`, `card.tsx`, `input.tsx`, `textarea.tsx`. There is no `dialog.tsx`, `alert-dialog.tsx`, or `drawer.tsx`.

## G. API Client Inventory
- **Legacy (`lib/api/client.ts`):** Used in Conversations, Settings, Message Studio, Logs, Media, Templates, Webhooks, Login, and Topbar.
- **V1 (`lib/api/v1-client.ts`):** Used in Activities, AI Agent, Automations, Campaigns, Contacts, Inbox, Labels, Messages, Notes, Quick Replies, Scheduled Messages, Search, Tasks.

## H. React Query/Query-Key Inventory
- **Centralized Keys:** `lib/api/v1-query-keys.ts` has keys for most modules except `campaigns`.
- **Feature Keys:** `features/campaigns/campaign.queries.ts` defines its own `campaignKeys`.
- **Direct Page Queries:** `app/(app)/*/page.tsx` files are directly instantiating `useQuery` instead of importing custom feature hooks.

## I. Realtime/Socket Inventory
- **Features:** Encapsulated within `features/campaigns/campaign.realtime.ts` and `features/inbox/inbox.realtime.ts`.
- **Campaigns Realtime Cache Issue:** `campaign.realtime.ts` listens to `campaign.updated`. When type is `stats_changed`, it invalidates `campaignKeys.detail(campaignId)` and `campaignKeys.recipients(campaignId)`, but **NOT** `campaignKeys.lists()`. Thus, if the campaign list view relies on `lists()` to show KPI data, the list data will be stale after a stats change.

## J. Duplicate Components
- Modals/Dialogs are repeatedly implemented from scratch across pages (see Section F).
- Loading states and empty states are likely inline since `components/shared` does not even exist.

## K. Design-System Violations
- No standardized UI components for Modals/Drawers, likely leading to hardcoded colors, spacing, and z-indexes for overlays.

## L. Dead/Unused Code
- To be determined as migration proceeds. The legacy `apiClient` should eventually become unused.

## M. Security/Repository Hygiene Issues
- `.next-stale-20260731-194327` directory exists in the repo.
- `tsconfig.tsbuildinfo.stale` and `tsconfig.typecheck.tsbuildinfo.stale` are accidentally committed.

## N. Migration Priority
1. **Foundation:** Build `components/ui/dialog.tsx`, `components/shared/ConfirmDialog`, and other missing UI primitives.
2. **Campaigns:** Finish the reference implementation. Fix the realtime invalidation issue for KPI data and remove legacy API client usage from `[id]/page.tsx`.
3. **Contacts:** Migrate to use the new UI primitives for modals.
4. **Inbox & AI Agent:** Refactor large monolithic pages.
5. **Conversations, Message Studio, Settings, etc.:** Migrate these legacy-heavy sections to the V1 architecture sequentially.

## O. Recommended Migration Sequence
1. Campaigns
2. Contacts
3. Inbox
4. AI Agent
5. Conversations
6. Message Studio
7. Automations
8. Scheduled
9. Templates
10. Quick Replies
11. Media
12. Settings
13. Webhooks
14. Search
15. Dashboard
16. remaining legacy areas
