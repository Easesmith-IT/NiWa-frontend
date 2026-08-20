# V1 Architecture Rules

## Directory Structure and Rules

### 1. `app/` (Routing Layer)
- Strictly for routing, route-level composition, page metadata, and minimal page state.
- **NO new business logic inside `app/**/page.tsx`.**
- Pages consume feature hooks instead of implementing their own data fetching or API logic.

### 2. `features/` (Business Domain Layer)
- Encapsulates domain logic for specific areas (e.g., `campaigns`, `inbox`).
- Contains:
  - `*.api.ts` (API calls via `v1ApiClient`)
  - `*.queries.ts` (React Query hooks)
  - `*.realtime.ts` (Socket/Realtime subscriptions)
  - `*.types.ts`
  - `*.mappers.ts`
  - `components/` (Feature-specific components and dialogs)
- React Query logic MUST belong inside feature query modules.
- Realtime code must not be duplicated across pages.

### 3. `components/ui/` (Reusable Primitives)
- Reusable, generic UI primitives (e.g., Dialog, Drawer, Button, Table).
- Do not create custom inline modal implementations (no `fixed inset-0`).
- Do not create duplicate Dialog/Drawer implementations. Use centralized primitives.

### 4. `components/shared/` (Cross-feature Components)
- Reusable cross-feature application components (e.g., `ConfirmDialog`, `PageHeader`, `EmptyState`, `DataTable`).
- Feature-specific dialogs belong under the feature's `components/` directory, not here.

### 5. `lib/` (Infrastructure Layer)
- Generic infrastructure, auth, utilities, configuration.
- Contains the V1 API Client (`v1-client.ts`).
- **NO new direct legacy `apiClient` usage.** V1 features must use `v1ApiClient`.

## State and Data Fetching
- Query keys must use a consistent feature query-key factory (e.g., `v1QueryKeys`).
- Do not create feature API calls directly inside page components.
- Feature realtime modules must handle React Query invalidation upon receiving events, passing the fresh data seamlessly to the UI.

## Modals and UI
- Confirmation dialogs must use a shared `ConfirmDialog` / `AlertDialog`.
- Forms inside dialogs should use reusable form primitives.
- No arbitrary hardcoded design-system colors when a semantic token exists.
- Do not duplicate implementations of `StatusBadge`, `PageHeader`, `EmptyState`, `LoadingState`, or `DataTable` without documented reasons.

## General Practices
- Do not move legacy code into a new folder and call that a migration.
- Preserve existing behavior unless demonstrably incorrect.
- Remove legacy code only after all usages have been migrated and verified.
- Do not change API contracts or backend behavior during this frontend migration.
