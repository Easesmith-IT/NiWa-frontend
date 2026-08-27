# V1 Migration Plan

## Phase 1: Build Missing V1 UI Foundation
**Goal:** Create centralized UI primitives so that features do not need to implement their own modals and dialogs.
- **Files to create:**
  - `components/ui/dialog.tsx`
  - `components/ui/alert-dialog.tsx`
  - `components/ui/drawer.tsx`
  - `components/shared/ConfirmDialog.tsx`
- **Risk:** Low
- **Verification:** Ensure existing `button.tsx` and `card.tsx` stylings are compatible. No existing features are modified yet.

## Phase 2: Campaigns Migration (Reference Implementation)
**Goal:** Make Campaigns the gold standard for the V1 architecture.
- **Current Architecture:** Hybrid. Uses `features/campaigns/` but `app/(app)/campaigns/[id]/page.tsx` still has inline API logic (`apiClient`) and modal implementations. Realtime cache invalidation for list KPIs is broken.
- **Target Architecture:** Pure V1. `app/(app)/campaigns/page.tsx` and `[id]/page.tsx` become thin wrappers delegating to feature components. Modals use the new UI primitives. Realtime updates correctly invalidate the lists cache.
- **Files to migrate:**
  - `app/(app)/campaigns/page.tsx`
  - `app/(app)/campaigns/[id]/page.tsx`
  - `app/(app)/campaigns/new/page.tsx`
  - `features/campaigns/campaign.realtime.ts` (Fix cache invalidation)
  - `features/campaigns/campaign.queries.ts` (Move to `v1QueryKeys` if desired, or standardize)
- **Risk:** Medium (Business logic changes to realtime).
- **Dependencies:** UI foundation from Phase 1.

## Phase 3: Contacts Migration
**Goal:** Migrate modals and standardize architecture.
- **Files to migrate:**
  - `app/(app)/contacts/page.tsx`
  - `features/contacts/components/ContactMergeModal.tsx`
  - `features/contacts/components/ContactImportMapping.tsx`
- **Risk:** Low

## Phase 4: Inbox & AI Agent Refactoring
**Goal:** Break down monolithic page components into feature-specific logical components.
- **Files to migrate:**
  - `app/(app)/inbox/page.tsx` -> Extract into `features/inbox/components/*`
  - `app/(app)/ai-agent/page.tsx` -> Extract into `features/ai-agent/components/*`
  - Replace inline modals in AI Agent with UI primitives.
- **Risk:** High (Large UI extraction, potential state breakage).

## Phase 5: Legacy Page Conversions (Conversations, Message Studio, Settings)
**Goal:** Move away from `lib/api/client.ts` completely for these features and encapsulate their logic in `features/*`.
- **Files to migrate:**
  - `app/(app)/conversations/page.tsx` -> `features/conversations/*`
  - `app/(app)/message-studio/page.tsx` -> `features/messages/*`
  - `app/(app)/settings/page.tsx`
- **Risk:** High (Creating new feature architectures for currently legacy code).

## Repository Hygiene
**Goal:** Clean up the repository.
- **Files to delete:**
  - `.next-stale-20260731-194327/`
  - `tsconfig.tsbuildinfo.stale`
  - `tsconfig.typecheck.tsbuildinfo.stale`
