# NIWA Unified UX & Navigation Specification

**Status:** Draft baseline for implementation planning  
**Target:** NIWA frontend, grounded in current main code and existing CRM UX research  
**Branch:** docs/unified-ux-navigation-spec  
**Decision rule:** Current repository code and backend contracts override older plans, mockups, and assumptions.

## 1. Purpose and product principle

NIWA brings together CRM, customer communication, AI assistance/calling, email automation, sales, products, inventory, purchasing, and finance. The interface must let a non-technical business user complete everyday work without needing to understand module boundaries or accounting/inventory internals.

**UX North Star: A user can complete a business task without knowing which NIWA module performs it.**

Prioritize clear next actions over feature inventories, plain language over internal terms, progressive disclosure over exposing every field, consistent interaction patterns over page-by-page invention, and preserving context across navigation.

This is a UX contract and audit baseline, not a claim that all proposed capabilities are implemented.

## 2. Evidence and implementation-status rules

Every finding must be classified:
- **VERIFIED CURRENT** — confirmed in current repository code or authoritative API contract.
- **PARTIALLY VERIFIED** — part of the workflow exists, but end-to-end behavior is not proven.
- **PROPOSED** — desired UX not confirmed in code.
- **NOT VERIFIED** — insufficient evidence.
- **BLOCKED** — depends on a missing API, permission, model, or unresolved product decision.

Do not infer feature availability from a navigation label, old report, screenshot, or architecture proposal. Do not invent backend APIs or data fields to satisfy a mockup. Audit current frontend and backend before implementation.

### Verified shell baseline

Current frontend main contains:
- components/layout/app-shell.tsx composing Sidebar, Topbar, and CommandPalette.
- A global Ctrl/Cmd+K listener to toggle the command palette.
- components/layout/navigation.ts with grouped navigation definitions, descriptions, and optional moduleKey.
- Current groups: Workspace, Products, Inventory, Purchasing, Sales, Finance, CRM, Automate, Content, Developer, and System.
- Existing route examples include /, /inbox, /products, /inventory, /purchasing/orders, /sales/orders, /sales/invoices, /sales/payments, /finance, /people, /contacts, /companies, /deals, /tasks, /pipelines, /ai-agent, /automations, /campaigns, /scheduled, /templates, and /quick-replies.
- The current shell is desktop-first, with a collapsible sidebar and topbar.

Sources:
- https://github.com/Easesmith-IT/NiWa-frontend/blob/main/components/layout/navigation.ts
- https://github.com/Easesmith-IT/NiWa-frontend/blob/main/components/layout/app-shell.tsx

Those files do not prove that all workflows work end-to-end, that universal Create exists, that AI Calling/email automation has a complete UI, that every detail page is consistent, or that permissions are correctly applied across routes. Those are audit items.

## 3. Global application shell

Refine the current shell rather than rebuilding it without evidence. Maintain a stable sidebar, topbar, page title/breadcrumb, content region, and global command entry point. Use consistent typography, spacing, focus indicators, dialogs, toasts, loading states, and responsive behavior.

Required behavior:
- Sidebar collapse/expand works predictably.
- Ctrl/Cmd+K opens the command palette; Escape closes it.
- Route transitions preserve relevant list state when returning from a record.
- Every page starts with a clear title and one primary action where applicable.
- Errors must not silently discard unsaved work.
- Keyboard focus remains visible and returns to the invoking control after a modal/drawer closes.

Acceptance: all authenticated routes use the same shell unless there is a justified full-screen workflow; active navigation is accurate for nested routes; mobile widths remain usable; no duplicate global keyboard handlers.

## 4. Sidebar information architecture

### Proposed user-facing groups

- **Home:** Overview, My Work
- **Sell:** Inbox, Customers, Leads/Deals, Orders, Invoices
- **Operate:** Products, Inventory, Purchasing, Suppliers
- **Money:** Payments, Expenses, Receivables, Payables, Finance/Reports
- **Automate:** AI assistance, AI Calling only if verified, Automations, Campaigns, Email only if verified, Templates
- **Settings:** Business, Team & access, Modules, Integrations, Advanced tools

This is a proposal, not a verified route list. Before changing navigation, map each current route to proposed label/group, module entitlement, permission, API dependencies, and verification status.

Rules:
- Avoid duplicate destinations for the same record.
- Keep accounting configuration and developer tools available to authorized users without making them dominant for ordinary users.
- Preserve module entitlement filtering and server-side authorization.
- Do not show dead links when a module is disabled.
- Preserve deep links or add approved redirects if routes change.

## 5. Home and My Work

Home answers: **What needs my attention?** Prefer a small actionable overview over a wall of charts:
- Conversations waiting for a reply, if the API supports the count.
- Tasks/follow-ups due or overdue.
- Orders requiring action.
- Low-stock items, if a reliable threshold is available.
- Overdue receivables or bills, if finance contracts expose them.
- Recent activity and quick actions.

Every metric must come from a verified source and link to the relevant filtered list. Hide cards for disabled modules or unavailable data. Never display fabricated zeroes when a request failed.

My Work aggregates actionable existing records for the current user: tasks, follow-ups, assigned work, and supported approvals/decisions. It must not invent a new universal task model. Actions include open, complete, reschedule, or assign only where supported and permitted.

Acceptance: users can act directly from Home/My Work; every card has loading, empty, partial-data, and error states; totals reconcile with source lists and respect workspace/permissions.

## 6. Universal search

Provide one entry point for records the user is authorized to access: people/contacts, companies, leads/deals, products, orders, invoices, suppliers, tasks, and other types only where APIs support them.

Requirements:
- Search by supported fields such as name, phone, email, business ID, SKU, and order/invoice number.
- Group results by understandable type and show enough context to distinguish duplicates.
- Keyboard navigation, Enter to open, Escape to close.
- Empty query may show recent items only if supported.
- Search results and direct navigation respect permissions.
- Do not describe local filtering as global search.

Audit current command palette sources, ranking, keyboard behavior, API use, and permissions before expanding it.

## 7. Universal Create

A global **+ Create** action is proposed, not assumed to exist. Offer only valid actions for the current user and enabled modules, such as customer/contact, task, deal, sale/order, product, purchase order, expense, or another verified entity.

Requirements:
- Searchable actions with plain labels and short explanations.
- Pre-fill context when launched from a record.
- Open the canonical existing creation flow; do not create duplicate forms.
- Ask for minimum required information first; disclose advanced fields progressively.
- Preserve form values after validation errors.
- Shortcuts must not bypass permissions, business rules, or entitlements.

No dead actions or fake success notifications.

## 8. Customer 360

Purpose: one coherent view of the relationship while preserving ownership boundaries across CRM, Communication, Sales, and Finance.

Proposed sections: Overview, Activity, Conversations, Deals, Orders/Invoices, Payments/balances, and Notes/files only where those APIs and relationships exist.

Header: display name, secondary identifier where available, phone/email/company, status, and contextual actions such as Message, Call, Create task, or New sale only when supported and permitted.

Rules:
- Do not duplicate authoritative customer fields in a new model.
- Preserve the distinction among Person, Contact/channel endpoint, and Company.
- Do not show financial balances as definitive unless sourced from the authoritative Finance contract.
- Explain when a related section is empty or unavailable because a module is disabled.

Acceptance: users can understand who the customer is, see recent context, and start the next supported action without losing their place.

## 9. Inbox ↔ CRM

Keep conversation work and customer context together without making Communication own CRM records or vice versa.

Proposed interaction:
- Conversation list and thread remain the primary workspace.
- Context panel shows linked person/contact/company and supported deals/tasks/orders.
- Open a related record in a drawer or full page and return to the same conversation.
- For unknown/ambiguous identity, offer link-existing or create-new only if supported by current contracts.
- AI output is clearly a suggestion unless a configured automation authorizes sending.

Guardrails: conversation references remain references; do not create fake WhatsApp conversations to represent calls or CRM activity. Respect communication and CRM permissions separately. Verify WhatsApp and email support independently.

## 10. Sales journey

Desired flow: Customer/lead → deal when appropriate → quotation if supported → sales order → invoice → payment → follow-up. Not every business must use every step.

Requirements:
- Clear New Sale flow with customer selection, product search, quantity, pricing/tax summary, and understandable validation.
- Show stock availability only where supported by Inventory contracts.
- Explain consequential effects before confirmation.
- After success, show only valid next actions such as send invoice/message or record payment.
- Use plain-language status labels while preserving technical status in advanced details.
- Preserve list filters, sorting, and scroll when returning.

Before designing status buttons, verify exact Sales Order, invoice, payment, return, and fulfillment lifecycles against backend validators and services.

## 11. Product → Inventory journey

The UI should show product identity and availability without exposing internal catalog/variant/inventory-level complexity by default.

Product list/detail: name, selling price, status, SKU where relevant, stock summary where supported. Actions such as Sell, Purchase, Adjust Stock appear only if route/API/permission exists.

Product creation starts with essentials; variants, identifiers, supplier links, dimensions, and advanced tracking are disclosed progressively.

Inventory rules:
- Use human-friendly quantity and location labels.
- Stock adjustments require a reason/confirmation where supported.
- Movement history is historical/read-only, not a replacement for stock operations.
- Never infer quantity from product metadata.
- Label valuation and quantity distinctly and source each from its authoritative API.

## 12. Purchase → Inventory journey

Desired flow: identify need/low stock → create purchase order → record supplier order → receive stock through the supported workflow → verify inventory update → handle supplier bill/payment through the appropriate Finance flow.

Requirements:
- Distinguish purchase order from supplier bill.
- Show supplier, items, quantities, and expected/received state only when supported.
- Receiving must follow backend lifecycle rules and explain stock effects.
- Do not imply that a purchase order automatically creates a supplier bill or accounting entry unless verified.
- Make partial receipt, cancellation, and recovery understandable where supported.

## 13. Invoice → Payment → Finance journey

Everyday language: “Customer owes”, “You owe suppliers”, “Record payment”, “Expense”, and “Financial reports”. Chart of Accounts, journals, trial balance, and tax mappings remain available to accounting users.

Rules:
- Cash, revenue, profit, receivables, and payables are different concepts.
- Invoice issued does not mean cash received.
- Finance owns accounting truth; Sales/Purchasing/Inventory own operational truth.
- Posted entries are immutable; corrections use reversal flows. Do not show misleading edit/delete controls.
- Do not create a second invoice/payment system in Finance.

Verify current contracts/routes for invoices, customer payments, expenses, supplier bills/payments, receivables/payables, reports, and activation/opening balance behavior before finalizing labels and totals.

## 14. Supplier journey

Supplier profile should show contact/business details and linked purchase orders, supplier bills, payments, and history only where those relationships exist.

Do not conflate supplier contacts, purchase orders, bills, and payments. Use the canonical Supplier record. Outstanding amounts must come from the authoritative Finance contract. Actions must be permission-aware and lifecycle-valid.

## 15. AI interaction model

AI appears inside work rather than forcing users to learn a separate AI subsystem:
- Inbox: draft/rewrite response.
- Customer/deal: summarize history or suggest follow-up.
- Calling record: summary/transcript/outcome/next action only if persisted and exposed.
- Inventory: explain verified low-stock signals.
- Finance: summarize verified outstanding items.

Rules:
- Clearly distinguish suggestion from completed action.
- Ask confirmation before irreversible, external, financial, or permission-sensitive actions unless a configured authorized automation applies.
- AI uses existing authorized service/API paths and cannot bypass permissions.
- Provide failure, uncertainty, and human-handoff states.
- Do not claim AI Calling or email automation is available until routes, contracts, permissions, and end-to-end behavior are verified.

## 16. Automation interaction model

Use plain language:
- **When this happens**
- **Check these conditions**
- **Then do this**

Offer templates only for triggers/actions the runtime can execute. Preview affected records and disclose external messages or business-data changes. Show enabled/paused state, last run, errors, and history only if backend support exists.

Do not expose raw event names, JSON payloads, or internal IDs to ordinary users by default. Never show an action that the runtime cannot execute.

## 17. Record/detail-page standard

Major record pages share:
1. Breadcrumb/back behavior that returns to the correct context.
2. Header with name, status, identifier, and primary action.
3. Predictable secondary-action menu.
4. Readable information sections.
5. Related records and activity/history where supported.
6. Clear status and next step.
7. Lifecycle- and permission-aware editing.
8. Unsaved-change protection and recoverable validation errors.

Do not force identical tabs onto record types that do not support them.

## 18. Drawer/peek standard

Use a drawer for quick inspection/light edits; use a full page for complex creation, multi-step work, and configuration.

- Opens without losing list state.
- Shows title and record identifier.
- Predictable close/back and keyboard focus behavior.
- Avoid nested drawers.
- Offer Open full page when work becomes complex.
- Responsive width; no universal hard-coded desktop width.
- Drawer uses the same API, validation, permissions, and error handling as the full page.

Specific width, Space-key activation, or record-cycling remains proposed until tested for accessibility and shortcut conflicts.

## 19. Context-preserving navigation

- Return from a record to the same list, query, filters, sort, and reasonable scroll position.
- Return from a CRM record opened from Inbox to the same conversation.
- Do not send users to Dashboard as a generic fallback.
- Deep links open the intended record when authorized.
- Browser Back/Forward behave predictably.
- Prefer URL state and explicit parent routes over fragile in-memory-only history.

Acceptance tests include list → detail → related record → back and Inbox → customer context → back to same conversation.

## 20. Role-based navigation

Build on existing module entitlements and RBAC, not a second hard-coded role system.

- Hide or disable destinations when module is disabled or user lacks access.
- Hide unavailable actions; server authorization remains authoritative.
- Distinguish disabled module from insufficient permission where product contracts allow.
- Role-based defaults can simplify the sidebar, while allowed capabilities remain discoverable.
- Test direct URL access as well as visible navigation.

Audit permission hooks, module registry, route guards, and API errors before specifying exact role layouts.

## 21. Progressive disclosure

Show fields required for common tasks first. Put advanced fields behind “More options” or an advanced section.

Examples:
- Product: name, type, selling price, unit first; SKU, variants, suppliers, dimensions, tracking options later.
- Sale: customer, items, quantity, price, totals first; advanced tax/discount/shipping fields only when supported.
- Finance: human-readable balances first; ledger details for authorized users.
- Automation: guided builder first; raw payloads/technical settings for advanced users.

Preserve entered values when sections open/close. Explain unfamiliar fields. Never hide required legal, financial, consent, or security information.

## 22. Empty, loading, error, and success states

Every data-driven screen defines:
- **Loading:** stable skeleton/progress; prevent duplicate submissions.
- **Empty:** explain purpose and offer one relevant next action.
- **No results:** show query and clear-filter action.
- **Error:** plain-language explanation and safe retry.
- **Permission denied:** explain access limits without exposing protected data.
- **Partial failure:** distinguish what succeeded from what failed.
- **Success:** confirm only server-confirmed results and show the next valid step.
- **Destructive action:** explain impact and require confirmation.
- **Stale/conflicting data:** prompt refresh/resolution without silent overwrite.

Never show an unexplained empty table or fabricated zeroes after a failed request.

## 23. First-time user experience

Build a setup checklist from real configuration state:
- Connect communication channels as needed.
- Add/import customers if supported.
- Add products/opening stock if enabled.
- Configure suppliers/purchasing if needed.
- Configure Finance activation/opening balances if Finance is enabled.
- Invite teammates and assign permissions.
- Configure automation after prerequisites exist.

Checklist links must target verified screens and completion must derive from real data/configuration. Do not force all businesses to configure every module before getting value. Demo data requires an explicit safe demo mode.

## 24. Terminology and plain-language rules

- Prefer “Customers” for customer work, while preserving distinctions among Person, Contact, and Company where necessary.
- Prefer “Stock” or “Inventory” based on user testing; avoid InventoryLevel/StockMovement as primary navigation labels.
- Purchase order and supplier bill are different documents.
- “Record payment” is an action; “Payment” is a record.
- Explain Receivables as “Money customers owe you” and Payables as “Money you owe suppliers”.
- Journal entry, Chart of Accounts, and Trial Balance remain available to accounting users.
- Do not rename statuses in a way that hides legal/accounting consequences.

Use concise sentence-case labels, verbs for actions, inline help for uncommon terms, consistent dates/currency/numbers, and no unexplained acronyms. Success copy must not claim effects that the server has not confirmed.

## 25. Mobile and responsive behavior

Current shell is desktop-oriented; mobile parity must be audited rather than assumed.

- Core tasks work on narrow screens without horizontal scrolling for primary forms.
- Sidebar becomes usable mobile navigation.
- Tables use compact rows/cards or deliberate horizontal scrolling with affordance.
- Drawers become full-screen sheets where appropriate.
- Touch targets, keyboard accessibility, focus, and sticky action bars are tested.
- Complex accounting tables/builders may be desktop-optimized but must remain usable.
- Verify calling and active-conversation behavior separately.

## 26. Cross-module notification/action system

Reuse existing notifications/events where verified; do not introduce a new event bus just for UX.

Notifications must explain what happened, link to the exact relevant record/action, respect workspace and record permissions, avoid retry duplicates, distinguish information from required action, and avoid sensitive transcript/customer/financial previews.

A unified attention queue may aggregate existing records, but each action must execute through its owning domain and report the actual result.

## 27. Cross-module acceptance journeys

Each journey must be mapped to current APIs before implementation.

1. **Inbound message:** Inbox → identify/link customer → inspect context → reply → create follow-up → return to same conversation.
2. **Lead to sale:** lead → deal → quotation if supported → order → invoice → payment.
3. **Sell product:** find product → inspect stock → create order → explain stock effect → invoice/payment.
4. **Replenish stock:** low-stock signal → purchase order → receive via supported flow → verify stock → supplier bill/payment through Finance if supported.
5. **Collect money:** receivable → invoice/customer → record payment through canonical flow → verify balance.
6. **Expense:** create expense → choose paid/unpaid state if supported → later payment if unpaid → verify report.
7. **AI follow-up:** review suggestion → approve/edit → execute through authorized API → show result.
8. **Permission boundary:** unauthorized user cannot see or execute action, including via direct URL/API.
9. **Failure recovery:** failed/partial save is clear and never falsely reports success.
10. **Return to context:** open a related record from a list/Inbox and return to the same state.

For each, record prerequisites, current route, API contract, permissions, lifecycle, success/error states, tests, and current/proposed status.

## 28. Implementation approach

### Work block A — read-only evidence audit
- Record current main SHAs for frontend and backend.
- Inventory route files, navigation, feature modules, shared shell, dialogs/drawers, search/create actions, permissions, breakpoints, and tests.
- Map journeys to backend routes, validators, service methods, permissions, and tests.
- Re-read the existing CRM research; carry forward verified findings, revalidating historical status against current code.
- Produce a gap matrix: current behavior, evidence path, proposed behavior, backend dependency, tests, confidence.

### Work block B — freeze the UX contract
- Finalize navigation groups and route map.
- Define shared patterns for page/record headers, lists, filters, drawers, forms, status/next action, and notifications.
- Define universal search/create only after capability audit.
- Define vocabulary and status-label mappings.
- Verify which AI Calling and email automation capabilities are actually exposed.

### Work block C — implement one coherent journey
Choose the highest-value journey based on actual readiness, likely Inbox ↔ CRM context and follow-up. Do not choose based on mockup appeal alone. Implement end-to-end with route, API, permission, loading/error/success states, tests, and context restoration.

### Work block D — apply patterns across domains
Apply shared patterns to Sales, Products/Inventory, Purchasing, and Finance in dependency-aware order. Preserve domain ownership and contracts.

### Work block E — verify
Run frontend typecheck, lint, unit tests, build, and relevant E2E tests. Run backend tests when contracts/behavior change. Report exact commands/results, SHAs, and test gaps. Never claim a test passed unless it was actually run.

## 29. Definition of done

- Navigation maps to real routes, permissions, and entitlements.
- No visible action is a dead end or fabricated capability.
- Primary business journeys work end-to-end against current APIs.
- Common tasks use consistent forms, record pages, drawers, and feedback.
- Context is preserved across related records and browser navigation.
- Loading, empty, error, partial-success, and permission states are covered.
- Responsive and keyboard behavior is tested.
- Existing business rules, audit trails, and server authorization remain intact.
- Typecheck, lint, tests, build, and relevant E2E results are truthfully reported.
- Backend dependencies are explicit; no unapproved backend redesign is hidden in frontend UX work.

## 30. Verified reality & closed audit findings

The comprehensive code audit conducted against latest `main` (Frontend commit `a08a3ee`, Backend commit `9252386`) has formally verified each item. Detailed evidence and line references are recorded in `docs/NIWA-UX-CURRENT-STATE-AUDIT.md` and `docs/NIWA-UX-GAP-MATRIX.md`.

1. **Route Inventory & Route Guards:**
   - 45+ frontend routes exist across `app/(app)/`.
   - Client-side route guards for disabled modules or viewer roles do **not** exist.
   - Backend enforces `requireModuleEnabled` for `products`, `inventory`, `sales`, `purchasing`, `finance`, and `ai_calling`. Rejection returns HTTP 403 `MODULE_DISABLED`.
2. **Command Palette & Search Sources:**
   - Command palette searches only Contacts and Conversations in the UI (messages and notes exist in API payload but are unrendered).
   - Global search queries only `ContactModel`, `ConversationModel`, `MessageModel`, `NoteModel`. Companies, Deals, Leads, Products, Orders, Invoices, and Tasks are **not** searchable.
   - **P0 Defect:** Backend `runGlobalSearch` ([search.service.ts#L27-L78](file:///e:/easesmith/niwa/NiWa-backend/src/modules/search/search.service.ts#L27-L78)) does not scope queries by `workspaceId`.
3. **Universal Create:**
   - **Missing.** No universal creation modal or drawer exists. Command palette "Create Contact" / "Create Automation" actions merely navigate to listing pages.
4. **Email Automation:**
   - **Unimplemented.** Zero email libraries (`nodemailer`, `@sendgrid/mail`, `resend`) in `package.json`. No email models, triggers, or workers exist anywhere in frontend or backend.
5. **AI Calling:**
   - **Backend Verified / Frontend Missing.** Complete backend implementation exists on `main` (`src/modules/ai-calling/`, Plivo telephony, and Python `voice-runtime/`). Frontend has zero UI pages or components.
6. **Customer 360 Aggregation:**
   - **Backend Verified / Frontend Missing.** Full service exists at `GET /api/crm/customer-360/:recordType/:recordId` ([customer-360.service.ts](file:///e:/easesmith/niwa/NiWa-backend/src/modules/crm-core/customer-360.service.ts)), but frontend never queries it.
7. **Mobile Navigation & Dynamic Entitlements:**
   - **Mobile Broken:** Sidebar has `hidden lg:flex` and lacks a mobile drawer component.
   - **Entitlements Unwired:** `filterNavigationByModules` exists in `navigation.ts` but is never called by `sidebar.tsx`.
8. **Commercial & Procurement Lifecycles:**
   - **Quotations:** Backend complete (`quotes.service.ts`, `/quotes`), frontend UI missing.
   - **Refunds:** Backend complete (`refunds.service.ts`, `/refunds`), frontend UI missing on returns page.
   - **Purchase Returns:** Backend complete (`purchasing.service.ts`, `/purchasing/returns`), frontend page missing.
   - **PO-to-Bill Bridge:** Goods receipt updates inventory, but does not generate a Supplier Bill in Finance. Manual re-entry required.
9. **Automation Catalog:**
   - Triggers strictly limited to `incoming_message` and `manual`. Steps strictly limited to `create_note`, `create_task`, `send_message`, `wait`.

