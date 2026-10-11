# NIWA: Evidence-Backed Unified UX Gap Matrix

**Status:** Authoritative Evidence-Backed Gap Matrix  
**Frontend Commit Baseline:** [`a08a3eefe7ff726e0f10314486d42bf465fbe4c6`](https://github.com/Easesmith-IT/NiWa-frontend/commit/a08a3eefe7ff726e0f10314486d42bf465fbe4c6) (branch: `docs/unified-ux-navigation-spec`, base: `main`)  
**Backend Commit Baseline:** [`925238622f676b7db010373ab25114dc7448ebf5`](https://github.com/Easesmith-IT/NiWa-backend/commit/925238622f676b7db010373ab25114dc7448ebf5) (branch: `main`)  
**Specification File:** `docs/NIWA-UNIFIED-UX-NAVIGATION-SPEC.md`  

---

## Priority Classification System

- **P0:** Security, data integrity, authorization, or critical business-flow failures.
- **P1:** Broken core workflows or missing capabilities that prevent normal business operations.
- **P2:** Significant usability problems, inconsistent navigation, or incomplete cross-module workflows.
- **P3:** Refinements, visual consistency, convenience, and lower-impact improvements.

---

## Detailed Requirement-by-Requirement Gap Matrix

### 1. Global Application Shell & Responsive Architecture

| Field | Content |
|---|---|
| **Area** | Global Application Shell / Mobile Navigation |
| **Priority** | **P0** (Critical usability and access failure for all mobile/tablet users) |
| **Target requirement** | Specification Section 3 & 25: Responsive shell where sidebar transforms into a mobile-friendly drawer/sheet, allowing full access to all modules on narrow screens. |
| **Current implementation** | Sidebar has `hidden lg:flex` ([`sidebar.tsx#L27`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/components/layout/sidebar.tsx#L27)). The topbar hamburger button toggles `sidebarCollapsed`, but the sidebar remains display `none` on viewports `< 1024px`. Mobile users cannot navigate anywhere. |
| **Status** | **CONFIRMED DEFECT / BROKEN** |
| **Evidence** | [`components/layout/sidebar.tsx#L27`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/components/layout/sidebar.tsx#L27); [`components/layout/topbar.tsx#L47-L49`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/components/layout/topbar.tsx#L47-L49); [`components/layout/app-shell.tsx#L10-L32`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/components/layout/app-shell.tsx#L10-L32). |
| **Backend dependency** | None (frontend shell layout issue). |
| **Permission considerations** | Mobile navigation must respect the same role and module visibility rules as desktop. |
| **UX impact** | Any user opening NIWA on a mobile phone, tablet, or narrow browser window cannot navigate between pages or modules. |
| **Required change** | Implement a responsive mobile drawer (Sheet/Dialog primitive) triggered by the hamburger button, rendering `navigationGroups` with touch-friendly spacing and auto-close on route transition. |
| **Regression risk** | Low; desktop layout remains unchanged. |
| **Acceptance criteria** | On viewports `< 1024px`, clicking the hamburger button opens a full-height navigation sheet. Tapping any route navigates and closes the sheet. Focus is trapped while open, ESC closes, touch backdrop dismisses, and `aria-expanded` / `aria-controls` attributes are present. |
| **Test coverage** | Existing: None. Required: Playwright mobile viewport test (`viewport: { width: 375, height: 667 }`) verifying hamburger drawer open, navigation, and close. |

---

| Field | Content |
|---|---|
| **Area** | Sidebar Information Architecture / Dynamic Module Filtering |
| **Priority** | **P1** (Violates workspace entitlements; shows dead navigation links) |
| **Target requirement** | Specification Section 4 & 20: Sidebar must dynamically hide or disable groups and items when a module is disabled for the workspace. |
| **Current implementation** | [`components/layout/navigation.ts#L429`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/components/layout/navigation.ts#L429) defines `filterNavigationByModules`, but [`components/layout/sidebar.tsx#L62`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/components/layout/sidebar.tsx#L62) maps raw `navigationGroups` directly. Disabled modules remain fully visible. |
| **Status** | **PARTIALLY IMPLEMENTED** (Filter logic exists in isolation, but uncalled) |
| **Evidence** | [`components/layout/sidebar.tsx#L62`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/components/layout/sidebar.tsx#L62); [`components/layout/navigation.ts#L429-L452`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/components/layout/navigation.ts#L429-L452); [`NiWa-backend/src/middleware/module-guard.middleware.ts#L40-L46`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/middleware/module-guard.middleware.ts#L40-L46). |
| **Backend dependency** | Existing: `GET /api/modules` returns enabled workspace modules ([`workspace-module.routes.ts`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/module-registry/workspace-module.routes.ts)). |
| **Permission considerations** | Workspace admin manages modules; all members must see only enabled modules. |
| **UX impact** | Users click navigation links for disabled modules (e.g., Finance, Purchasing), only to encounter HTTP 403 errors or empty pages. |
| **Required change** | Fetch enabled modules in `WorkspaceContext`, and pass them to `filterNavigationByModules(navigationGroups, enabledModuleKeys)` in `sidebar.tsx`. |
| **Regression risk** | Low; modules without `moduleKey` remain permanently visible as core. |
| **Acceptance criteria** | When a module (e.g., `finance`) is disabled in backend, all finance sidebar links disappear completely from the sidebar. |
| **Test coverage** | Existing unit test: [`lib/navigation/navigation.test.ts#L75`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/lib/navigation/navigation.test.ts#L75). Required: Component test verifying `Sidebar` re-renders when enabled modules change. |

---

| Field | Content |
|---|---|
| **Area** | Topbar / Breadcrumbs & Contextual Actions |
| **Priority** | **P2** (Navigation context loss; inability to know record depth) |
| **Target requirement** | Specification Section 3 & 17: Topbar provides hierarchical breadcrumbs for deep record routes and contextual primary actions. |
| **Current implementation** | Topbar resolves title by prefix matching `routeMeta` ([`topbar.tsx#L37-L42`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/components/layout/topbar.tsx#L37-L42)). No breadcrumbs exist. Primary actions are absent. "API Live" is a hardcoded static pill ([`topbar.tsx#L66-L69`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/components/layout/topbar.tsx#L66-L69)). |
| **Status** | **MISSING** |
| **Evidence** | [`components/layout/topbar.tsx#L37-L75`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/components/layout/topbar.tsx#L37-L75). |
| **Backend dependency** | None. |
| **Permission considerations** | None. |
| **UX impact** | Users on record detail pages (e.g. `/products/prod_123`, `/purchasing/orders/po_456`) see generic topbar labels and cannot easily navigate back to parent lists. |
| **Required change** | Add dynamic breadcrumbs parsing pathname segments with friendly labels; replace static "API Live" with actual connectivity state or remove it; add slot for page primary action. |
| **Regression risk** | Low. |
| **Acceptance criteria** | Route `/products/[id]` renders `Products > [Product Name or SKU]` breadcrumb; clicking `Products` returns to the preserved list view. |
| **Test coverage** | Existing: None. Required: Vitest component test for `Breadcrumbs`. |

---

### 2. Universal Search & Universal Create

| Field | Content |
|---|---|
| **Area** | Universal Search / Multi-Tenant Data Isolation |
| **Priority** | **P0** (Critical security vulnerability: cross-workspace data leakage) |
| **Target requirement** | Specification Section 6 & 20: Search must only return records belonging to the active workspace. |
| **Current implementation** | `ContactModel`, `ConversationModel`, and `MessageModel` are protected by `workspaceIsolationPlugin` via `AsyncLocalStorage`. However, `NoteModel`'s schema ([`src/models/note.model.ts`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/models/note.model.ts)) lacks `workspaceId`. Because `workspaceIsolationPlugin` skips schemas without `workspaceId`, `NoteModel.find({ content: regex })` in `runGlobalSearch` ([`search.service.ts#L69-L78`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/search/search.service.ts#L69-L78)) executes unpartitioned, returning notes from other workspaces. |
| **Status** | **CONFIRMED VULNERABILITY** |
| **Evidence** | Empirical verification in `test-search-isolation-2.ts` confirmed that Workspace B's note returned in Workspace A search results. [`NiWa-backend/src/models/note.model.ts#L6-L17`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/models/note.model.ts#L6-L17); [`NiWa-backend/src/models/shared/workspace-plugin.ts#L4-L8`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/models/shared/workspace-plugin.ts#L4-L8); [`NiWa-backend/src/modules/search/search.service.ts#L69-L78`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/search/search.service.ts#L69-L78). |
| **Backend dependency** | Schema and service update in `NiWa-backend`. |
| **Permission considerations** | Mandatory tenant partition across all collections. |
| **UX impact** | Exposure of other customers' confidential notes in search results. |
| **Required change** | Add `workspaceId: { required: true, type: String, index: true }` to `noteSchema` in `note.model.ts`. Ensure `createNote` in `notes.service.ts` assigns `workspaceId`. Add migration/default for existing notes. Ensure `search.service.ts` explicitly scopes queries. |
| **Regression risk** | Low; ensures proper tenant boundary. |
| **Acceptance criteria** | Search executed in Workspace A never returns contacts, conversations, messages, or notes belonging to Workspace B under any query string. |
| **Test coverage** | Existing: None for search note isolation. Required: Add regression test in `src/tests/workspace-isolation.test.ts`. |

---

| Field | Content |
|---|---|
| **Area** | Universal Search / Entity Scope & Destination Routing |
| **Priority** | **P1** (Core discovery feature fails for 80% of business entities) |
| **Target requirement** | Specification Section 6: Single entry point to search People, Companies, Deals, Products, Orders, Invoices, Suppliers, and Tasks. Result click navigates directly to the record. |
| **Current implementation** | Backend only searches contacts, conversations, messages, notes. Frontend CommandPalette only renders contacts and conversations. Clicking a contact navigates to generic `/contacts` listing ([`command-palette.tsx#L144`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/components/layout/command-palette.tsx#L144)). Deals, Products, Orders, Invoices are completely unsearchable. |
| **Status** | **PARTIALLY IMPLEMENTED / BROKEN DESTINATIONS** |
| **Evidence** | [`NiWa-backend/src/modules/search/search.service.ts#L31-L78`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/search/search.service.ts#L31-L78); [`components/layout/command-palette.tsx#L121-L157`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/components/layout/command-palette.tsx#L121-L157). |
| **Backend dependency** | `search.service.ts` must be extended to query `ProductModel`, `DealModel`, `SalesOrderModel`, `InvoiceModel`, `PurchaseOrderModel`. |
| **Permission considerations** | Omit entity types if the user lacks module entitlement or read permission. |
| **UX impact** | Business users cannot find orders, invoices, products, or deals via search. Clicking a contact dumps the user on an unfiltered table. |
| **Required change** | Extend `runGlobalSearch` to return categorized results (people, deals, products, orders, invoices); update `CommandPalette.tsx` to group results by entity with direct deep links (e.g. `/products/${id}`, `/sales/orders?id=${id}`). |
| **Regression risk** | Performance risk: ensure search queries on secondary models use indexes (e.g. regex/text on `orderId`, `sku`, `title`). |
| **Acceptance criteria** | Typing an order number (e.g. `SO-0001`) returns the Sales Order. Clicking it opens the order detail. Typing a product SKU returns the product. |
| **Test coverage** | Existing: [`features/search/search.queries.ts`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/features/search/search.queries.ts). Required: Backend integration test for multi-entity search and frontend navigation test. |

---

| Field | Content |
|---|---|
| **Area** | Universal Create Workflow |
| **Priority** | **P1** (Missing global productivity entry point; pseudo-actions mislead users) |
| **Target requirement** | Specification Section 7: Global `+ Create` action offering context-aware creation of Customer/Person, Deal, Sales Order, Product, Task, or PO without opening full blank pages. |
| **Current implementation** | **MISSING**. No global create button exists. Command palette provides pseudo-actions ("Create Contact", "Create Automation") that merely navigate to `/contacts` or `/automations` listing pages ([`command-palette.tsx#L19-L21`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/components/layout/command-palette.tsx#L19-L21)). |
| **Status** | **MISSING** |
| **Evidence** | [`components/layout/command-palette.tsx#L17-L24`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/components/layout/command-palette.tsx#L17-L24); [`components/layout/topbar.tsx#L56-L74`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/components/layout/topbar.tsx#L56-L74). |
| **Backend dependency** | Existing endpoints: `POST /api/crm/people`, `POST /api/crm/deals`, `POST /api/orders`, `POST /api/products`, `POST /api/tasks`, `POST /api/purchasing/orders`. |
| **Permission considerations** | Actions must only appear if the user has `WRITE` permission for the corresponding module. |
| **UX impact** | Users cannot quickly record a task, person, or sale while in another module. Misleading command palette actions cause confusion. |
| **Required change** | Implement a global `+ Create` menu button in Topbar and Command Palette that opens a canonical creation drawer/modal with progressive disclosure. |
| **Regression risk** | Low; invokes existing mutation hooks. |
| **Acceptance criteria** | Clicking `+ Create > New Task` from any page opens a quick task creation dialog. On save, record persists and user remains on current page with toast feedback. |
| **Test coverage** | Existing: None. Required: Vitest tests for `UniversalCreateModal`. |

---

### 3. CRM Suite & Customer 360

| Field | Content |
|---|---|
| **Area** | CRM / Customer 360 Aggregation View |
| **Priority** | **P1** (High-value feature built on backend but completely inaccessible) |
| **Target requirement** | Specification Section 8: Single 360 view of a customer displaying overview, activity timeline, conversations, open deals, orders, and balance. |
| **Current implementation** | Backend has a fully tested `Customer360Service` ([`customer-360.service.ts`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/crm-core/customer-360.service.ts#L49-L399)) at `GET /api/crm/customer-360/:recordType/:recordId`. Frontend **never calls this endpoint**. The `PersonDetailDrawer` ([`people/page.tsx#L616`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/app/%28app%29/people/page.tsx#L616)) only displays basic emails, phones, and linked company tags. |
| **Status** | **PARTIALLY IMPLEMENTED (Backend complete; Frontend completely missing)** |
| **Evidence** | [`NiWa-backend/src/modules/crm-core/customer-360.service.ts`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/crm-core/customer-360.service.ts); [`NiWa-backend/src/modules/crm-core/crm-core.routes.ts#L76`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/crm-core/crm-core.routes.ts#L76); [`app/(app)/people/page.tsx#L601-L750`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/app/%28app%29/people/page.tsx#L601-L750). |
| **Backend dependency** | Existing: `GET /api/crm/customer-360/:recordType/:recordId` (requires `CRM.Customer360:READ`). |
| **Permission considerations** | Requires `requireCrmPermission("CRM.Customer360", "READ")`. |
| **UX impact** | Sales reps and account managers cannot see deal history, pending tasks, or communication context when viewing a customer profile. |
| **Required change** | Create `useCustomer360Query` hook and embed Customer 360 tabs (Timeline, Deals, Tasks, Conversations, Commercial Orders) inside `PersonDetailDrawer` and `CompanyDetailDrawer`. |
| **Regression risk** | Low; additive UI to the existing slideover drawers. |
| **Acceptance criteria** | Opening a Person drawer displays active deals count/value, open tasks, recent activities, and recent WhatsApp messages. |
| **Test coverage** | Existing backend test: [`customer-360-permissions.test.ts`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/crm-core/customer-360-permissions.test.ts). Required: Frontend hook and component rendering tests. |

---

| Field | Content |
|---|---|
| **Area** | CRM / Deals Detail View & Activity Timeline |
| **Priority** | **P1** (Core CRM entity lacks detail inspection) |
| **Target requirement** | Specification Section 17 & 18: Consistent record drawer/page for Deals showing deal value, pipeline stage, linked customer, notes, activity history, and next steps. |
| **Current implementation** | Deals only has Kanban board ([`DealBoardView.tsx`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/features/deals/components/DealBoardView.tsx)), table view ([`DealListView.tsx`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/features/deals/components/DealListView.tsx)), and create/move modals. **There is no deal detail view or drawer**. Clicking a deal card does nothing. |
| **Status** | **MISSING** |
| **Evidence** | [`features/deals/components/DealsShell.tsx`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/features/deals/components/DealsShell.tsx); [`features/deals/components/DealBoardView.tsx#L1-L150`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/features/deals/components/DealBoardView.tsx#L1-L150). |
| **Backend dependency** | Existing: `GET /api/crm/deals/:id` ([`crm-core.routes.ts#L70`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/crm-core/crm-core.routes.ts#L70)). |
| **Permission considerations** | Requires `CRM.Deals:READ`. |
| **UX impact** | Sales reps cannot view deal history, add notes, inspect participant contacts, or see associated quotes without editing the deal. |
| **Required change** | Build `DealDetailDrawer` with summary header, stage progress stepper, linked person/company cards, and activity/notes tab. |
| **Regression risk** | Low; board drag-and-drop remains intact. |
| **Acceptance criteria** | Clicking any deal on the board or list opens `DealDetailDrawer`. User can update stage, edit value, view timeline, and link quotes. |
| **Test coverage** | Existing: [`features/deals/deal.test.ts`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/features/deals/deal.test.ts). Required: Drawer interaction and query tests. |

---

| Field | Content |
|---|---|
| **Area** | CRM / Leads Management Surface |
| **Priority** | **P1** (Entire domain entity inaccessible from navigation) |
| **Target requirement** | Specification Section 4 & 10: Leads view allowing qualification, status tracking, and conversion into Deals and Accounts. |
| **Current implementation** | Backend has complete Leads CRUD and conversion service ([`crm-core.routes.ts#L59-L65`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/crm-core/crm-core.routes.ts#L59-L65)). Frontend has **no `/leads` page** in `app/(app)`. [`LeadFormModal.tsx`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/features/leads/components/LeadFormModal.tsx) is orphaned. |
| **Status** | **MISSING (Frontend page absent)** |
| **Evidence** | Route directory `app/(app)/leads/` does not exist; [`NiWa-backend/src/modules/crm-core/crm-core.routes.ts#L60-L65`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/crm-core/crm-core.routes.ts#L60-L65). |
| **Backend dependency** | Existing: `GET /api/crm/leads`, `POST /api/crm/leads`, `POST /api/crm/leads/:id/convert`. |
| **Permission considerations** | Requires `CRM.Leads:READ` and `CRM.Leads:WRITE`. |
| **UX impact** | Users cannot view, filter, or convert leads outside of the conversation context drawer in Inbox. |
| **Required change** | Add `app/(app)/leads/page.tsx` with list view, status filters (New, Contacted, Qualified, Disqualified), and one-click "Convert to Deal" modal. Add to sidebar navigation. |
| **Regression risk** | Low; new route and view. |
| **Acceptance criteria** | User navigates to `/leads`, creates a lead, converts it to a Deal, and verifies the new Deal appears on the pipeline board. |
| **Test coverage** | Existing backend test: [`crm-core.test.ts`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/crm-core/crm-core.test.ts). Required: Frontend leads list and conversion tests. |

---

| Field | Content |
|---|---|
| **Area** | CRM / Tasks Linked Record Selector (ObjectId Hex Flaw) |
| **Priority** | **P2** (Severe usability flaw for non-technical users) |
| **Target requirement** | Specification Section 1 & 24: Plain language, intuitive selection of related entities (Person, Deal, Company) without technical internal IDs. |
| **Current implementation** | In [`LinkedRecordSelector.tsx#L97-L98`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/features/tasks/components/LinkedRecordSelector.tsx#L97-L98), users must type or paste a 24-char raw MongoDB ObjectId: `<input placeholder="Enter ${selectedType} ID..." />`. |
| **Status** | **USABILITY DEFECT** |
| **Evidence** | [`features/tasks/components/LinkedRecordSelector.tsx#L82-L110`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/features/tasks/components/LinkedRecordSelector.tsx#L82-L110). |
| **Backend dependency** | Existing endpoints: `GET /api/crm/people`, `GET /api/crm/companies`, `GET /api/crm/deals`. |
| **Permission considerations** | Respect user read permissions for selected entity. |
| **UX impact** | Ordinary business users cannot link tasks to people or deals because they have no access to or understanding of MongoDB ObjectIds. |
| **Required change** | Replace raw input with a searchable Combobox / Typeahead component querying People, Companies, or Deals by name/title and resolving the ID behind the scenes. |
| **Regression risk** | Low; passes the same `{ recordType, recordId }` payload to the task mutation. |
| **Acceptance criteria** | Selecting "Person" presents a searchable dropdown of people. Selecting "John Doe" automatically stores John's ID and displays his name tag. |
| **Test coverage** | Existing: None. Required: Unit test for combobox search and selection. |

---

| Field | Content |
|---|---|
| **Area** | Inbox ↔ CRM / Inbound Contact Identity Linking |
| **Priority** | **P1** (Breaks end-to-end customer onboarding from WhatsApp) |
| **Target requirement** | Specification Section 9: Inbound WhatsApp conversation allows one-click linking to an existing Person/Company or creating a new Person directly from the conversation context. |
| **Current implementation** | `ContactProfileSection` ([`ContactProfileSection.tsx#L50-L78`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/features/inbox/components/ContactProfileSection.tsx#L50-L78)) only edits string attributes on `ContactModel`. There is no button to link the contact to a `PersonModel` or create a Person from the Inbox. Linking must be initiated from `/people`. |
| **Status** | **PARTIALLY IMPLEMENTED / MISSING INBOX CONTROLS** |
| **Evidence** | [`features/inbox/components/ContactProfileSection.tsx#L45-L100`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/features/inbox/components/ContactProfileSection.tsx#L45-L100); [`app/(app)/people/page.tsx#L581-L591`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/app/%28app%29/people/page.tsx#L581-L591). |
| **Backend dependency** | Existing: `POST /api/contacts/:id/link-person` and `POST /api/contacts/:id/unlink-person` ([`contacts.routes.ts`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/contacts/contacts.routes.ts)). |
| **Permission considerations** | Requires `contacts.update:WRITE` and `CRM.People:WRITE`. |
| **UX impact** | Support/sales reps chatting with an incoming customer on WhatsApp cannot link them to CRM without opening a separate browser tab, navigating to `/people`, and finding the contact manually. |
| **Required change** | In `InboxContactSidebar`, add a "Link to CRM Person" combobox and a "+ Create Person from Contact" button that prepopulates name and phone number. |
| **Regression risk** | Strictly bounded to `InboxContactSidebar`; zero modifications to core WhatsApp messaging. |
| **Acceptance criteria** | Inside an active conversation, clicking "Create Person" creates a `PersonModel`, links `contact.personId`, and immediately activates the Deals and Tasks tabs. |
| **Test coverage** | Existing: [`contacts/contact-identity-resolution.test.ts`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/contacts/contact-identity-resolution.test.ts). Required: Frontend integration test for Inbox contact linking. |

---

### 4. Sales, Purchasing & Inventory

| Field | Content |
|---|---|
| **Area** | Sales / Quotations Lifecycle |
| **Priority** | **P1** (Core commercial quotation workflow completely absent in UI) |
| **Target requirement** | Specification Section 10: Sales workflow supporting quotation creation, customer acceptance, and conversion into a Sales Order. |
| **Current implementation** | Backend has full Quotes API ([`quotes.routes.ts`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/sales/quotes.routes.ts#L1-L68)) and `convertQuoteHandler` ([`orders.routes.ts#L36`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/sales/orders.routes.ts#L36)). Frontend has **zero Quotes pages, zero navigation entries, and zero UI components**. |
| **Status** | **MISSING (Frontend absent)** |
| **Evidence** | Directory `app/(app)/sales/quotes/` does not exist; [`NiWa-backend/src/modules/sales/quotes.service.ts`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/sales/quotes.service.ts); [`NiWa-backend/src/modules/sales/quotes.routes.ts`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/sales/quotes.routes.ts). |
| **Backend dependency** | Existing: `GET /api/quotes`, `POST /api/quotes`, `PATCH /api/quotes/:id`, `POST /api/quotes/:id/accept`, `POST /api/orders/convert-quote/:quoteId`. |
| **Permission considerations** | Requires `sales:READ` and `sales:WRITE` (under `SALES_PERMISSIONS.QUOTES`). |
| **UX impact** | Businesses that issue price quotes before confirming sales orders cannot use NIWA for quote generation or customer approval. |
| **Required change** | Build `app/(app)/sales/quotes/page.tsx` with Quote table, New Quote modal, and "Convert to Sales Order" action. Add Quotes to sidebar under Sales. |
| **Regression risk** | Low; uses established sales API contracts. |
| **Acceptance criteria** | User creates a Quote, marks it Accepted, clicks "Convert to Order", and is redirected to the generated Sales Order in Draft status. |
| **Test coverage** | Existing backend test: [`quotes.test.ts`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/sales/quotes.test.ts). Required: Frontend quotes page and conversion tests. |

---

| Field | Content |
|---|---|
| **Area** | Sales / Customer Refunds Interface |
| **Priority** | **P1** (Returns cannot be financially settled from UI) |
| **Target requirement** | Specification Section 10: Returns workflow integrates financial adjustment (credit notes or payment refund). |
| **Current implementation** | Backend has `/refunds` routes and service ([`refunds.routes.ts`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/sales/refunds.routes.ts); [`refunds.service.ts`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/sales/refunds.service.ts)) with automated double-entry GL posting. Frontend [`sales/returns/page.tsx`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/app/%28app%29/sales/returns/page.tsx) handles returns receiving, but has **no Refund action or modal**. |
| **Status** | **MISSING (Frontend absent)** |
| **Evidence** | [`NiWa-backend/src/modules/sales/refunds.routes.ts`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/sales/refunds.routes.ts); [`app/(app)/sales/returns/page.tsx#L1-L150`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/app/%28app%29/sales/returns/page.tsx#L1-L150). |
| **Backend dependency** | Existing: `POST /api/refunds` (requires `sales.refunds:WRITE`). |
| **Permission considerations** | Requires `requirePermission("sales.refunds", "WRITE")`. |
| **UX impact** | After receiving returned merchandise, managers cannot execute customer refunds or credit settlements from the UI. |
| **Required change** | Add "Issue Refund" button on approved/received returns in `SalesReturnsPage`, opening a modal to select refund account (Bank/Cash), payment method, and amount. |
| **Regression risk** | Low; calls existing backend refund service. |
| **Acceptance criteria** | Clicking "Issue Refund" on a received return posts to `/api/refunds`, creates GL journal entries, and marks the return refunded. |
| **Test coverage** | Existing backend test: [`finance-p2-customer-refund.test.ts`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/finance/finance-p2-customer-refund.test.ts). Required: Returns UI refund modal test. |

---

| Field | Content |
|---|---|
| **Area** | Purchasing / PO Goods Receipt → Supplier Bill Bridge |
| **Priority** | **P1** (Severe cross-module friction; manual double-entry) |
| **Target requirement** | Specification Section 12: Receiving a purchase order explains financial effects and seamlessly transitions into supplier bill settlement in Finance. |
| **Current implementation** | Goods receipt updates inventory stock ([`purchasing.service.ts#L527`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/purchasing/purchasing.service.ts#L527)), but does **not provide a Draft Bill creation action**. Users must navigate to `/finance/payables` and manually re-enter supplier, line items, and prices from scratch. |
| **Status** | **DISCONNECTED WORKFLOW** |
| **Evidence** | [`NiWa-backend/src/modules/purchasing/purchasing.service.ts#L461-L555`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/purchasing/purchasing.service.ts#L461-L555); [`NiWa-backend/src/modules/finance/bills/bills.service.ts`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/finance/bills/bills.service.ts). |
| **Backend dependency** | `POST /api/finance/bills` exists; action bridges received PO lines to Draft Bill. |
| **Permission considerations** | Requires `purchasing.read` and `finance.bills:WRITE`. |
| **UX impact** | Procurement staff must manually double-enter bills into accounting after receiving shipments, creating reconciliation errors. |
| **Required change** | Implement an explicit user action "Create Draft Supplier Bill" on received POs that pre-fills supplier, received quantities, and purchase prices into a draft bill, allowing price variance adjustment, tax/freight additions, and preventing duplicate billing via `billedQuantity` tracking. |
| **Regression risk** | Low; creates draft bill without mutating PO history. |
| **Acceptance criteria** | On a received PO, clicking "Create Draft Supplier Bill" opens a pre-populated bill form linked to the PO reference number. |
| **Test coverage** | Existing: None for cross-module bill generation. Required: Integration test verifying PO items map accurately to Supplier Bill lines. |

---

| Field | Content |
|---|---|
| **Area** | Purchasing / Purchase Returns Lifecycle |
| **Priority** | **P2** (Supplier returns cannot be initiated via UI) |
| **Target requirement** | Specification Section 12: Supplier return workflow to send damaged/defective stock back to suppliers and update inventory/finance. |
| **Current implementation** | Backend has complete Purchase Returns service and routes ([`purchasing.routes.ts#L80-L96`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/purchasing/purchasing.routes.ts#L80-L96); [`purchasing.service.ts#L650-L750`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/purchasing/purchasing.service.ts#L650-L750)). Frontend has **no Purchase Returns page** in `app/(app)/purchasing/`. |
| **Status** | **MISSING (Frontend absent)** |
| **Evidence** | Route directory `app/(app)/purchasing/returns/` does not exist; [`NiWa-backend/src/modules/purchasing/purchasing.routes.ts#L80-L96`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/purchasing/purchasing.routes.ts#L80-L96). |
| **Backend dependency** | Existing: `GET /api/purchasing/returns`, `POST /api/purchasing/returns`. |
| **Permission considerations** | Requires `purchasing.return:WRITE`. |
| **UX impact** | Users cannot log supplier returns in the UI to remove defective inventory and initiate supplier debit notes. |
| **Required change** | Add `app/(app)/purchasing/returns/page.tsx` with return creation modal and list view. Add link under Purchasing in the sidebar. |
| **Regression risk** | Low; new route. |
| **Acceptance criteria** | User creates a purchase return against a received PO; stock is deducted from warehouse and confirmed return posts to Finance GL. |
| **Test coverage** | Existing backend test: [`purchasing-api.test.ts`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/tests/purchasing-api.test.ts). Required: Frontend purchase return view tests. |

---

### 5. Automation, AI & Communication

| Field | Content |
|---|---|
| **Area** | AI / AI Calling Interface |
| **Priority** | **P2** (Major new capability on backend with no frontend surface) |
| **Target requirement** | Specification Section 15 & 30: AI Calling integration surfaced only where verified; displays call logs, transcripts, and status. |
| **Current implementation** | Backend has full AI Calling system on `main` ([`src/modules/ai-calling/`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/ai-calling/)) with Plivo streaming, FastRTC runtime (`voice-runtime/`), call transcripts, and CRM memory sync. Frontend has **zero UI pages or components**. |
| **Status** | **PARTIALLY IMPLEMENTED (Backend live; Frontend absent)** |
| **Evidence** | [`NiWa-backend/src/modules/ai-calling/ai-calling.routes.ts`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/ai-calling/ai-calling.routes.ts); [`NiWa-backend/voice-runtime/server.py`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/voice-runtime/server.py); No `ai-calling` files in `NiWa-frontend`. |
| **Backend dependency** | Existing: `GET /api/ai-calling/calls`, `POST /api/ai-calling/outbound`, `GET /api/ai-calling/numbers`. |
| **Permission considerations** | Requires `requireModuleEnabled("ai_calling")` and `CRM.People:READ`. |
| **UX impact** | Users cannot view call recordings, inspect AI call transcripts, or initiate outbound AI calls from the UI. |
| **Required change** | Build `app/(app)/ai-calling/page.tsx` displaying Call History, Live Call status, and Call Audio/Transcript player; embed "Call via AI" button in CRM Person profile. |
| **Regression risk** | Low; completely new feature module. |
| **Acceptance criteria** | Authorized user can view list of completed AI phone calls, read full transcript, and play back call audio. |
| **Test coverage** | Existing backend tests: [`ai-calling-streaming.test.ts`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/ai-calling/ai-calling-streaming.test.ts). Required: Frontend call logs and audio player tests. |

---

| Field | Content |
|---|---|
| **Area** | Automation / Email Automation Scope Resolution |
| **Priority** | **BLOCKED / SPECIFICATION CORRECTION** |
| **Target requirement** | Specification Section 1, 4, 15: Clarification of email automation support. |
| **Current implementation** | **100% UNIMPLEMENTED**. Backend has no email packages (`nodemailer`, `@sendgrid/mail`, `resend` are absent from `package.json`). `automations.dto.ts` steps only support `create_note`, `create_task`, `send_message` (WhatsApp), and `wait`. Zero email routes or models exist. |
| **Status** | **UNIMPLEMENTED / FUTURE ARCHITECTURE DEPENDENCY** |
| **Evidence** | [`NiWa-backend/package.json#L41-L63`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/package.json#L41-L63); [`NiWa-backend/src/modules/automations/automations.dto.ts#L32`](https://github.com/Easesmith-IT/NiWa-backend/blob/925238622f676b7db010373ab25114dc7448ebf5/src/modules/automations/automations.dto.ts#L32). |
| **Backend dependency** | Completely missing: requires email provider integration, DKIM/SPF domain verification, email templates, and BullMQ worker. |
| **Permission considerations** | N/A until implemented. |
| **UX impact** | Specification misleadingly promised email automation when no underlying engine exists. |
| **Required change** | Update specification to explicitly classify Email Automation as "UNIMPLEMENTED / FUTURE ARCHITECTURE DEPENDENCY" and remove email placeholders from UI navigation. |
| **Regression risk** | Zero. |
| **Acceptance criteria** | Specification updated with factual evidence; no phantom email options shown to users. |
| **Test coverage** | None. |

---

### 6. Error, Loading, Empty & Unauthorized States

| Field | Content |
|---|---|
| **Area** | System Standards / Module-Disabled & Unauthorized States |
| **Priority** | **P2** (Confusing error handling when accessing restricted routes) |
| **Target requirement** | Specification Section 22: Distinct loading skeletons, friendly empty states with primary call to action, and explicit explanation for disabled modules or permission limits. |
| **Current implementation** | When an API rejects with 403 `MODULE_DISABLED`, pages render generic error banners (`"Failed to fetch"`) or empty tables with no explanation ([`sales/orders/page.tsx#L221-L223`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/app/%28app%29/sales/orders/page.tsx#L221-L223)). No global `ModuleDisabledFallback` exists. |
| **Status** | **PARTIALLY IMPLEMENTED** |
| **Evidence** | [`features/sales/`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/features/sales/); [`app/(app)/sales/orders/page.tsx`](https://github.com/Easesmith-IT/NiWa-frontend/blob/a08a3eefe7ff726e0f10314486d42bf465fbe4c6/app/%28app%29/sales/orders/page.tsx). |
| **Backend dependency** | Backend returns structured 403 `AppError` with message `Module [X] is disabled for this workspace`. |
| **Permission considerations** | Distinguish between `403 MODULE_DISABLED` (workspace entitlement) and `403 INSUFFICIENT_PERMISSIONS` (user role). |
| **UX impact** | Users conclude the application is broken or experiencing server downtime rather than understanding that the feature is disabled by their administrator. |
| **Required change** | Create `ModuleDisabledCard` and `PermissionDeniedCard` components; wire `apiClient` interceptor or React Query error boundaries to render clear explanatory state with "Contact Administrator" button. |
| **Regression risk** | Low; improves error presentation across all modules. |
| **Acceptance criteria** | Navigating to `/finance` when disabled renders an explanatory card: *"Finance & Accounting is currently disabled for this workspace. Contact your administrator to enable it."* |
| **Test coverage** | Existing: None. Required: Error boundary unit test. |
