# V1 Migration Progress

## Phase 1: Complete Codebase Audit
- [x] Initial Codebase Inspection
- [x] Create `V1-MIGRATION-AUDIT.md`
- [x] Create `V1-MIGRATION-PLAN.md`
- [x] Create `V1-ARCHITECTURE.md`

## Phase 2: Build Missing V1 UI Foundation
- [x] `components/ui/dialog.tsx`
- [x] `components/ui/alert-dialog.tsx`
- [x] `components/ui/drawer.tsx`
- [x] `components/shared/ConfirmDialog.tsx`

## Phase 3: Campaigns Migration
- [x] Migrate `app/(app)/campaigns/page.tsx`
- [x] Migrate `app/(app)/campaigns/[id]/page.tsx`
- [x] Migrate `app/(app)/campaigns/new/page.tsx`
- [x] Fix realtime invalidation in `campaign.realtime.ts`
- [x] Replace inline modals with new Dialog UI components

> **Note:** Phase 2B list/detail UI decomposition completed.
> **Note:** Phase 2C (Campaign Wizard Migration) fully completed across 2C-A to 2C-E:
>   - Phase 2C-A: Extracted wizard state management into `useCampaignWizardState()`.
>   - Phase 2C-B: Decomposed `app/(app)/campaigns/new/page.tsx` into a thin route composition layer.
>   - Phase 2C-C: Migrated creation screen data access to V1 React Query hooks.
>   - Phase 2C-D: Migrated contact import polling to `useContactImportPipelineV1()` in `contact.queries.ts` with unmount & concurrent upload safety.
>   - Phase 2C-E: Extracted `useCampaignDraftLifecycle()` and `useCampaignLaunch()`, replaced legacy `window.confirm` with V1 `ConfirmDialog`, and unified query keys under `v1QueryKeys.campaigns`.
> **Note:** Minor Campaign list visual/content refresh occurred during UI decomposition.
> **Note:** Alert-based error handling on Campaign delete remains as future UX debt (pending a global notification/toast primitive).

## Phase 4: Contacts Migration
- [ ] ...

## Phase 5: Inbox & AI Agent Refactoring
- [x] Inbox V1 Architecture Audit (`INBOX-V1-AUDIT.md`)
- [x] Phase 2D-B: Inbox Type Safety & API Boundary (`3ee92d2`)
- [x] Phase 2D-C: Inbox State Orchestration (`9f3c903`)
- [x] Phase 2D-D: Inbox UI Decomposition - Thread List & Layout (`InboxLayout`, `InboxThreadList`, `ThreadListItem`, `ContactAvatar`)
- [ ] Phase 2D-E: Inbox UI Decomposition - Chat Window & Composer
- [ ] Phase 2D-F: Inbox UI Decomposition - Contact Sidebar
- [ ] Phase 2D-G: Inbox Final Cleanup & Verification
- [ ] AI Agent V1 Migration
