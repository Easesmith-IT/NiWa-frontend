# Campaigns V1 Migration Audit

## A. Current Campaign Architecture
The Campaigns feature is currently a hybrid of V1 directory structures (`features/campaigns/`) and monolithic legacy patterns in the `app/(app)/campaigns/` pages.
While `features/campaigns/campaign.api.ts` and `campaign.queries.ts` exist, the application heavily bypasses them. The page routes themselves handle large amounts of business logic, direct API calls, manual state management for forms, and complex UI rendering.

## B. Page Responsibility Breakdown
1. **`app/(app)/campaigns/page.tsx`**: 
   - Renders the campaign list, handles search/filter state.
   - Calculates KPI stats inline.
   - Uses `window.confirm` for deletion instead of a UI primitive.
2. **`app/(app)/campaigns/[id]/page.tsx`**: 
   - A 500+ line monolith.
   - Handles route, fetches campaign detail, recipients, and quota data inline.
   - Computes complex performance formulas directly in the component.
   - Directly calls the legacy `apiClient` for CSV exports.
3. **`app/(app)/campaigns/new/page.tsx`**: 
   - 450+ line wizard controller.
   - Manages state for all 6 steps.
   - Directly triggers `v1ApiClient` calls for hydration and auxiliary data.
   - Handles draft saving and launching directly rather than relying on feature mutations.

## C. Feature Responsibility Breakdown
The `features/campaigns/` folder contains standard V1 patterns (`campaign.api.ts`, `campaign.queries.ts`, `campaign.realtime.ts`). However, the `components/` inside it are deeply coupled to the wizard's local state.

## D. Legacy Dependencies
- Legacy `apiClient` is used in `app/(app)/campaigns/[id]/page.tsx` for CSV exports.
- `apiClient` is imported (though unused directly) in `new/page.tsx` and `Step2WhatsAppTemplate.tsx`.
- Native browser `window.confirm` is heavily used for destructive actions (deleting campaigns and drafts).

## E. API Architecture
- Core campaign CRUD uses `campaign.api.ts` (using `v1ApiClient`).
- However, secondary entities like contacts, connections, templates, and quotas are fetched directly using `v1ApiClient` inside the page components and wizard steps instead of utilizing domain-specific API files or queries.

## F. React Query Architecture
- `campaign.queries.ts` exists and exposes `campaignKeys`.
- However, `useQuery` is frequently written inline (e.g., `["quota", connectionId]`, `["whatsapp-connections"]`) within the pages, completely bypassing feature boundaries.

## G. Query-key Architecture
`campaignKeys` is well-structured in `campaign.queries.ts`:
```ts
campaignKeys.all
campaignKeys.lists()
campaignKeys.details()
campaignKeys.detail(id)
campaignKeys.recipients(id, filters)
```
But inline query keys like `["quota"]`, `["whatsapp-connections"]`, and `["contact-imports-list"]` are scattered throughout the codebase.

## H. Realtime Architecture
- Encapsulated in `campaign.realtime.ts` via `useCampaignRealtime()`.
- Successfully deduplicates socket connections.
- Subscribes to `campaign.updated`.
- Flaw: Incomplete query invalidation (described in Section N).

## I. Modal/Dialog Architecture
- No standard V1 modals are used in Campaigns.
- Destructive confirmations (`Delete Campaign`, `Delete Draft`) rely entirely on native `window.confirm`.
- Step mode switching in `Step3Audience` relies on an inline inline warning rather than a proper `AlertDialog`.

## J. State-Management Architecture
- Mostly local `useState` in `new/page.tsx` (drilled down into 6 steps).
- Query state via React Query (mixed between `campaign.queries.ts` and inline `useQuery`).
- No global state (Redux/Zustand), which is good, but the prop drilling in the wizard is immense.

## K. Component Duplication
- Custom table implementations for lists.
- Inline badge generation logic (`getStatusBadge`, `getStatusColor`) duplicated between list and detail pages.
- Stat card rendering duplicated across pages.

## L. Large Components
- `app/(app)/campaigns/[id]/page.tsx` (~540 lines)
- `app/(app)/campaigns/page.tsx` (~470 lines)
- `app/(app)/campaigns/new/page.tsx` (~460 lines)
- `features/campaigns/components/Step3Audience.tsx` (~380 lines)

## M. Campaign Statistics Data Flow
- Detail Page: Calculates performance stats (Delivery Rate, Read Rate, Failure Rate) directly in the render function based on `campaign.stats`.
- List Page: Loops through all `data.campaigns` inside a `useMemo` to compute overall KPIs for the dashboard cards.

## N. Identified Bugs
**Critical Campaign Stats Bug:**
In `campaign.realtime.ts`, the `handleCampaignUpdated` function processes `stats_changed` events by invalidating `campaignKeys.recipients(campaignId)` and `campaignKeys.detail(campaignId)`. However, it **does not invalidate** `campaignKeys.lists()`. Because the executive KPI dashboard in `page.tsx` derives its totals by mapping over `data.campaigns` (which uses `lists()`), the KPI cards become permanently stale until a hard browser refresh or a different realtime event (like `status_changed`) forces a list invalidation.

## O. Target Architecture
1. Move all inline API fetches to their respective feature API files (or at least centralize them if cross-domain).
2. Move inline `useQuery` definitions into standard query hooks.
3. Replace `window.confirm` with Phase 1 `ConfirmDialog`.
4. Decompose the monolith pages into smaller, feature-owned presentation components (e.g., `CampaignKpiCards`, `CampaignHeader`, `CampaignWizard`).
5. Move CSV export logic into `campaign.api.ts`.
6. Fix the realtime invalidation gap for stats.

## P. Migration Sequence
1. **Realtime & Cache Fixing:** Fix `campaign.realtime.ts` to invalidate `lists()` during `stats_changed`.
2. **API & Queries:** Extract inline `v1ApiClient` usages (quota, connections, templates, contacts) into standardized V1 hooks. Extract CSV export to `campaign.api.ts`.
3. **Modals:** Replace `window.confirm` with `ConfirmDialog` in the list, detail, and new pages.
4. **Decomposition (List Page):** Extract `CampaignKpiCards`, `CampaignStatusBadge`, and `CampaignTable`.
5. **Decomposition (Detail Page):** Extract detail header, performance analytics, and recipient explorer.
6. **Cleanup:** Remove legacy `apiClient` imports, ensure thin pages.

## Q. Risk Assessment
- Changing realtime invalidation might increase network requests if not throttled correctly (the current 1.5s bounded throttle is safe).
- Abstracting wizard state could introduce form regressions; we should preserve the current prop-drilling state for safety unless a refactor is explicitly needed.
- CSV export uses Blob parsing. Moving it must preserve the exact `responseType: "blob"` behavior.

## R. Verification Strategy
- Perform manual validation of the realtime stats bug.
- Verify CSV export successfully downloads a valid file.
- Verify draft creation, campaign validation, and deletion flows.
- Ensure `npm run typecheck` and `npm run build` pass smoothly.
