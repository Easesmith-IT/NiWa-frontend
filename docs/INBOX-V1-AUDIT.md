# Inbox V1 Migration Audit

## 1. Executive Summary
The `inbox` feature is the most heavily utilized domain in the application and represents the core daily driver for users. 
While the Data (React Query/`v1ApiClient`) and Realtime (`useInboxRealtime`) layers have been largely migrated to V1 standards, the **UI layer is a massive 2,311-line monolith** located at `app/(app)/inbox/page.tsx`.
This route file holds 36 `useState` hooks, 9 `useEffect` hooks, and consumes 30 different queries/mutations. 
Migrating this UI layer will unblock shared conversational components for other features (like AI Agent) and drastically reduce the primary technical debt bottleneck of the frontend.

**Recommendation:** `inbox` is the strongest candidate for the next V1 UI decomposition migration.

---

## 2. Current Architecture
- **Route Structure**: `app/(app)/inbox/page.tsx` (Monolithic route, 2,311 lines).
- **Feature Structure**: `features/inbox/` exists. It currently houses the data layer, mappers, and realtime hooks.
- **Component Hierarchy**: Practically non-existent. Skeletons and lightboxes exist in `features/inbox/components`, but the entire functional layout (Thread List, Chat Window, Composer, Sidebar) is inlined in the route.
- **API Files**: `inbox.api.ts` (100% migrated to `v1ApiClient`).
- **Query Files**: `inbox.queries.ts` (100% migrated to `v1QueryKeys`).
- **Realtime Files**: `inbox.realtime.ts` (Handles socket subscriptions and query invalidation).

---

## 3. Top Alternative Candidates Ranked
1. **Inbox** (Selected: Highest architectural value, highest monolithic UI debt, unblocks shared chat components).
2. **AI Agent** (High value, 1.6k line route, but less dependent on by other systems than Inbox).
3. **Contacts** (Foundational CRM entity, but largely already V1-compliant with only a ~400-line route remaining).

---

## 4. API / Data Map
All domain operations have been safely moved to React Query hooks, but the monolithic route imports hooks from across the entire system:
- **Inbox Domain**: `useInboxThreadsV1Query`, `useInboxThreadDetailV1Query`, `useInboxThreadStateMutation`, `useSyncInboxThreadHistoryV1Mutation`
- **Contacts Domain**: `usePatchContactV1Mutation`
- **Labels Domain**: `useLabelsV1Query`, `useAddContactLabelV1Mutation`, `useRemoveContactLabelV1Mutation`
- **Messages Domain**: `useSendTextMessageV1Mutation`
- **Notes Domain**: `useCreateContactNoteV1Mutation`, `usePatchNoteV1Mutation`, `useDeleteNoteV1Mutation`, `useSetNotePinnedV1Mutation`
- **Tasks Domain**: `useTasksV1Query`, `useCreateTaskV1Mutation`, `useCompleteTaskV1Mutation`, `useCancelTaskV1Mutation`
- **AI Agent Domain**: `useAgentsQuery`, `useTransferConversationAgentMutation`, `useUpdateConversationAIModeMutation`
- **Quick Replies Domain**: `useQuickRepliesV1Query`, `usePatchQuickReplyV1Mutation`
- **Scheduled Messages Domain**: `useScheduledMessagesV1Query`, `useCreateScheduledMessageV1Mutation`

---

## 5. Legacy Dependencies & Modal Audit
- **Direct API Calls**: 1 remaining `fetch()` call for `getMessageMediaUrlV1` bypassing `v1ApiClient`.
- **Modals**: Custom Radix-style modals are used inline. Zero usage of `window.confirm` or `window.alert`.
- **Type Safety (`any` / `as any`)**: Multiple instances found circumventing TypeScript. See Bugs/Risks below.

---

## 6. Concrete Bugs & Risks

### A. Severe UI Monolith
- **Severity**: CRITICAL
- **Location**: `app/(app)/inbox/page.tsx`
- **Problem**: 2,311 lines mixing networking, sidebars, modals, message composers. Changing one thing causes massive re-renders and merge conflicts.
- **V1 Solution**: Decompose into `InboxThreadList`, `InboxChatWindow`, `InboxContactSidebar`, and `ChatComposer`. Move state to `useInboxState`.

### B. Incomplete V1 Types (`as any` usage)
- **Severity**: HIGH
- **Location**: `app/(app)/inbox/page.tsx`
- **Code Path**: `(detail.conversation as any).aiMode`, `(message as any).generatedByAI`
- **Problem**: Circumvents the TypeScript compiler for AI-agent routing and message rendering.
- **V1 Solution**: Add `aiMode`, `metadata`, and `assignedAgentId` to `InboxThreadRecordV1` in `inbox.types.ts`. Add `generatedByAI` and `source` to `InboxMessageRecordV1`.

### C. Stale Closures & Mutation Refs
- **Severity**: MEDIUM
- **Location**: `app/(app)/inbox/page.tsx`
- **Code Path**: `const threadMutationRef = useRef(threadMutation.mutate);`
- **Problem**: React anti-pattern to store mutate functions in refs to bypass callback dependency arrays for realtime handlers.
- **V1 Solution**: Extract realtime callback orchestration into a dedicated `useInboxRealtimeHandlers` hook with correct dependencies.

### D. Direct Fetch Call for Media
- **Severity**: LOW
- **Location**: `app/(app)/inbox/page.tsx`
- **Code Path**: `const response = await fetch(getMessageMediaUrlV1(messageId), ...)`
- **Problem**: Bypasses standard `v1ApiClient` interceptors and token refresh logic.
- **V1 Solution**: Migrate media fetching to `v1ApiClient.get(..., { responseType: 'blob' })`.

---

## 7. Target V1 Architecture

```text
app/(app)/inbox/page.tsx
→ Thin composition layer (renders InboxLayout)

features/inbox/
├── components/
│   ├── InboxLayout.tsx (Main container)
│   ├── ThreadList/
│   │   ├── InboxThreadList.tsx
│   │   ├── ThreadListItem.tsx
│   ├── ChatWindow/
│   │   ├── InboxChatWindow.tsx
│   │   ├── ChatMessageList.tsx
│   │   ├── ChatComposer.tsx
│   ├── ContactSidebar/
│   │   ├── InboxContactSidebar.tsx
│   │   ├── ContactNotes.tsx
│   │   ├── ContactTasks.tsx
├── hooks/
│   ├── useInboxState.ts (UI state orchestration)
│   ├── useInboxRealtimeHandlers.ts
├── inbox.api.ts
├── inbox.queries.ts
├── inbox.types.ts
├── inbox.mappers.ts
├── inbox.realtime.ts
└── index.ts
```

---

## 8. Proposed Migration Phases

- **Phase 2D-A:** Audit / architecture map (Completed).
- **Phase 2D-B:** Type Safety & API completeness (Update `inbox.types.ts`, remove `as any`, fix media fetch).
- **Phase 2D-C:** State Orchestration (Extract `useInboxState` and `useInboxRealtimeHandlers`).
- **Phase 2D-D:** UI Decomposition - Thread List & Layout.
- **Phase 2D-E:** UI Decomposition - Chat Window & Composer.
- **Phase 2D-F:** UI Decomposition - Contact Sidebar.
- **Phase 2D-G:** Final cleanup and verification.

---

## 9. Behavioral Contract (MUST NOT BREAK)
- **Realtime Updates**: Socket events for new messages, typing indicators, and thread state MUST immediately reflect in the UI without full-page reloads.
- **Read State**: Viewing an active thread MUST mark it as read securely.
- **Scroll Position**: Message lists MUST retain scroll position when paginating or receiving new messages.
- **Cache Integrity**: No duplicate WebSocket subscriptions. No manual cache wiping (`queryClient.removeQueries`) outside of standard invalidation parameters.
- **Routing**: `app/(app)/inbox` and query parameter persistence (e.g. `?thread=id`) MUST remain functionally identical.

---

## 10. File Protections
- **Files Expected to Change**: `app/(app)/inbox/page.tsx`, `features/inbox/inbox.types.ts`, new `features/inbox/components/*` files.
- **Files Explicitly Protected**: `features/inbox/inbox.realtime.ts`, `features/inbox/inbox.api.ts` (except for media fetch additions). No backend files may be touched. No `contacts`, `campaigns`, or `labels` API files may be modified.
