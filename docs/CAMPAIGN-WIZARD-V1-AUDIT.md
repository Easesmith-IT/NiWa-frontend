# CAMPAIGN WIZARD V1 AUDIT

## 1. Executive Summary
The Campaign Creation Wizard (`app/(app)/campaigns/new/page.tsx`) was intentionally skipped during Phase 2A and 2B due to its complexity. This audit maps the wizard's architecture to prepare for a safe migration to the V1 standard.

The primary finding is that the wizard operates as a **Monolith**, orchestrating all state across 6 steps in the main page component. While Phase 2A successfully stripped `any` and `unknown as` types from the wizard (it is now fully type-safe), the wizard still uses legacy direct API access (`v1ApiClient`), manual promise-based polling for contact imports, and complex cross-step state propagation.

## 2. Current Architecture
- **Root Orchestrator:** `app/(app)/campaigns/new/page.tsx` (441 lines).
- **State Management:** 21 `useState` variables in the root component, drilled down via props.
- **Data Fetching:** A mix of React Query (`useWhatsAppConnections`, `useContactImportsV1Query`) and direct API client usage (`createCampaignDraft`, `listContactsV1`, `uploadContactImportV1`).
- **Persistence:** Draft updates occur manually on "Save Draft" clicks or transparently on "Next" during Launch (Step 6). Hydration occurs via an effect reading the `?draft=xxx` URL parameter.

## 3. Wizard State Inventory

| State Variable | Type | Owner | Persistence | Notes |
|---|---|---|---|---|
| `currentStep`, `maxReachedStep` | number | Root Page | Session only | Controls `CampaignWizardStepper` navigation. |
| `draftId` | string \| null | Root Page | URL `?draft=` | Used to determine if mutation is `POST` or `PATCH`. |
| `isSavingDraft`, `lastSavedTime` | boolean, string | Root Page | Session only | Local UI tracking for draft header. |
| `name`, `description` | string | Root Page | Draft API | Gathered in Step 1. |
| `connectionId`, `templateId` | string | Root Page | Draft API | Gathered in Step 2. |
| `selectedTemplateObj` | `MetaTemplate` | Root Page | Session only | Derived from `templateId` in Step 2, passed to Step 4. |
| `audienceType` | enum | Root Page | Draft API | `import` \| `select` \| `tags`. |
| `importId` | string | Root Page | Draft API | Populated in Step 3 after CSV upload/poll. |
| `selectedContactMap` | Record<string, ContactItem> | Root Page | Draft API | Populated in Step 3. Hydration requires `listContactsV1` fetch. |
| `tagsInput` | string | Root Page | Draft API | Populated in Step 3. |
| `variableValues` | Record<string, string> | Root Page | Draft API | Populated in Step 4. Derived dynamically based on `selectedTemplateObj`. |
| `scheduleType` | enum | Root Page | Draft API | `now` \| `scheduled`. |
| `scheduledAt`, `timezone` | string | Root Page | Draft API | ISO date string and localized timezone. |

## 4. State Dependency Graph
```text
Step 1 (Campaign Details) 
       ↓ `name`, `description` (Required for valid draft creation)
Step 2 (WhatsApp Template)
       ↓ `connectionId`
       ↓ `templateId` → resolves `selectedTemplateObj`
Step 3 (Audience)
       ↓ `audienceType`, `importId`, `selectedContactMap`, `tagsInput`
Step 4 (Message Variables)
       ↑ reads `selectedTemplateObj` from Step 2 to generate variable inputs
       ↓ `variableValues`
Step 5 (Schedule)
       ↓ `scheduleType`, `scheduledAt`, `timezone`
Step 6 (Review & Launch)
       ↑ Reads ALL state to construct `CreateCampaignPayload`
```
**Cross-Step Quirk**: `selectedTemplateObj` is hoisted to the root page by Step 2 so that Step 4 can render the dynamic variable form. If Step 2's template changes, `variableValues` is NOT explicitly cleared in an effect, which could result in stale variables mapped to a new template until overwritten.

## 5. Step-by-Step Data Flow
- **Step 1:** Pure controlled inputs.
- **Step 2:** Queries `useWhatsAppConnections` and `useTemplates`. Auto-selects the first connected WhatsApp account.
- **Step 3:** Queries `useContactImportsV1Query` and `useContactsV1Query`. Executes direct API mutations (`uploadContactImportV1`, `commitContactImportV1`) and uses a manual `while` loop for polling import status.
- **Step 4:** Pure UI component. Maps over `selectedTemplateObj.components` to generate text/media inputs.
- **Step 5:** Pure UI component. Date/time pickers.
- **Step 6:** Aggregates all props. Triggers `useCreateCampaign` or `updateCampaignDraft`, followed by `useValidateCampaign`.

## 6. Draft Lifecycle
1. **Hydration**: Handled by a massive `useEffect` looking for `?draft=id`. Calls `getCampaignById` directly via API, parses values, and conditionally calls `listContactsV1` to hydrate contact selection names.
2. **Explicit Save**: User clicks "Save Draft" -> Constructs `CreateCampaignPayload` -> Uses `createMutation` (if new) or `updateCampaignDraft` direct API (if existing).
3. **Implicit Save**: During Step 6 Launch, the draft is created/updated before the final `validateMutation` is fired to materialize it.

## 7. API / Query Audit
**GOOD (Feature Queries/Mutations):**
- `useWhatsAppConnections`
- `useTemplates`
- `useContactImportsV1Query`, `useContactsV1Query`
- `useCreateCampaign`, `useValidateCampaign`, `useDeleteCampaign`

**LEGACY (Direct API Clients needing migration):**
- `createCampaignDraft` (used via direct API import in root)
- `updateCampaignDraft` (used via direct API import in root)
- `getCampaignById` (used in hydration effect)
- `listContactsV1` (used in hydration effect)
- `uploadContactImportV1`, `validateContactImportV1`, `commitContactImportV1`, `getContactImportV1` (used in Step 3 polling).

## 8. Cross-Domain Dependencies
- **Contacts**: High coupling in Step 3 for CSV uploads and Audience selection.
- **WhatsApp Connections / Templates**: High coupling in Step 2.
- **Media**: Not explicitly decoupled; variables currently handle string URLs or text.
- **Quotas**: Currently NO explicit quota fetching/validation logic is present in the wizard (unlike the Campaign Detail page).

## 9. Contact Import Flow (Step 3)
**Trace:**
File drop -> `uploadContactImportV1` -> `validateContactImportV1` -> `commitContactImportV1` -> `while(attempts < 20)` loop polling `getContactImportV1` (1000ms sleep) -> `importsQuery.refetch()`.
**Issues:** Unsafe unmount (polling continues if user clicks Next), UI blocked by long-running async function, relies on direct API calls rather than React Query mutations.

## 10. Template / Connection Flow
- **Coupling:** Step 2 selects `connectionId` and `templateId`. `templateId` resolves to `selectedTemplateObj`.
- **Invalidation:** Changing `connectionId` does NOT invalidate `templateId`. Changing `templateId` does NOT clear `variableValues` in Step 4.

## 11. Quota / Scheduling Flow
- **Scheduling:** `scheduleType` ("now" vs "scheduled"). Managed via standard controlled inputs.
- **Quota:** Not evaluated during the wizard. Relies on the backend to enforce quotas upon Launch/Validate.

## 12. Launch Flow
**Trace (Step 6):**
`handleLaunch` -> Sets `isSubmitting` -> Constructs `CreateCampaignPayload` -> If no draft ID, calls `createMutation`. If draft ID, calls `updateCampaignDraft` direct API -> Awaits `validateMutation` (which moves Campaign from draft to validating/scheduled) -> Router pushes to `campaigns/[id]`.
**Protection:** `if (isSubmitting) return;` prevents double-submission.

## 13. Type Architecture
- Phase 2A completely cleaned up the wizard types. There are exactly **0** instances of `any`, `unknown as`, or `@ts-ignore` in the wizard folder.
- Type definitions are correctly sourced from feature types (`CreateCampaignPayload`, `ContactRecordV1`).

## 14. Monolith Analysis (`page.tsx`)
- **Line Count:** 441
- **State Variables:** 21
- **API/Query Dependencies:** 5 Queries/Mutations + 4 Direct API calls.
- **Conclusion:** The page serves as a massive state orchestrator.

## 15. Component Responsibility Analysis
- `Step1`: GOOD (Primarily presentational)
- `Step2`: MIXED (UI + Server State: fetches connections/templates)
- `Step3`: BAD (UI + API + polling + mutation + local orchestration)
- `Step4`: GOOD (Primarily presentational)
- `Step5`: GOOD (Primarily presentational)
- `Step6`: GOOD (Primarily presentational review sheet)

## 16. Target V1 Architecture
```text
app/(app)/campaigns/new/page.tsx (Thin Route Wrapper)
 └─ features/campaigns/screens/CampaignCreateScreen.tsx (Orchestrator)
     ├─ useCampaignWizardState() (Custom hook containing the 21 state vars)
     ├─ useCampaignDraftLifecycle() (Custom hook for URL hydration & auto-saving)
     └─ CampaignWizardStepper
     └─ Step1...Step6
```
Step 3 (Audience) should be refactored to use a properly wrapped `useUploadContactImport` React Query mutation with `onSuccess` invalidation, removing the direct `while()` loop polling in favor of query refetch intervals or server-sent events.

## 17. Proposed Phase 2C Sub-Phases
- **2C-A (State Orchestration):** Extract the 21 `useState` hooks and hydration `useEffect` from `page.tsx` into isolated custom hooks (`hooks/useCampaignWizardState`, `hooks/useCampaignDraft`).
- **2C-B (Route Thinning):** Move the remaining JSX structure from `page.tsx` into `features/campaigns/screens/CampaignCreateScreen.tsx`.
- **2C-C (API Layer Migration):** Replace direct `v1ApiClient` imports (Draft Save, Contact Hydration) in the new hooks with standard React Query mutations/queries.
- **2C-D (Step 3 Polling Migration):** Refactor `Step3Audience` contact upload loop to use a formal React Query mutation + polling architecture.

## 18. Behavioral Contract
The following MUST remain unchanged during Phase 2C:
- The 6-step logical sequence.
- Draft persistence payload structure.
- CSV import mappings and the 4-step commit requirement (`upload`->`validate`->`commit`->`poll`).
- `?draft=id` URL hydration behavior.
- Next/Back behavior.

## 19. Risk Matrix
| Area | Risk | Reason | Severity | Migration Strategy |
|---|---|---|---|---|
| Step 3 Polling | High | Manual `while` loop blocks UI & has unmount race conditions | CRITICAL | Migrate to React Query `refetchInterval` or a strictly managed state machine. |
| Draft Hydration | High | Relies on `listContactsV1` directly. Complex effect. | HIGH | Extract to a specialized `useCampaignDraftHydration` hook. |
| Variable Stale State | Medium | Changing templates leaves old variable values | MEDIUM | Implement a clean effect in the state manager to wipe `variableValues` on `templateId` change. |
| Direct API Usage | Medium | Bypasses Query Cache / Global Error Handlers | HIGH | Replace all `v1ApiClient` calls with existing or new `useMutation` hooks. |

## 20. Migration Recommendations
Do not rewrite the wizard from scratch. Apply the "Strangler Fig" pattern:
1. Lift the state directly into a hook without changing its shape.
2. Swap the direct API calls for React Query equivalents one by one.
3. Clean up the `while()` polling loop in Step 3.
4. Finally, thin out the route component.