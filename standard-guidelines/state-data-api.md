# State, Data and API Standard

## 1. State Architecture

Separate state by responsibility.

### UI state

Local component state is appropriate for small visual concerns such as:

- modal open/closed state
- selected tab
- temporary input
- dropdown state

### Feature state

Use feature hooks for domain state such as:

- filters
- selection
- forms
- workspace state

### Complex orchestration

Use an orchestration hook to coordinate multiple domain concerns.

Avoid one giant hook containing every state variable in a feature.

## 2. Avoid Duplicate State

There should be one authoritative owner for a piece of state.

Bad:

```text
page.tsx
  └── selectedId

component.tsx
  └── selectedId
```

Prefer:

```text
useFeatureSelection
       ↓
single source of truth
       ↓
components
```

## 3. Side Effects

`useEffect` must not become a dumping ground for business logic.

Every effect should have:

- a clear reason
- explicit dependencies
- a predictable lifecycle

Prefer moving reusable effects into domain hooks. If an effect represents server synchronization, consider whether the query/data abstraction is the correct owner.

## 4. API Architecture

UI components must **not directly perform HTTP requests**.

HTTP operations belong in the feature API layer:

```text
features/messages/
├── messages.api.ts
├── messages.queries.ts
└── messages.types.ts
```

Components consume typed hooks/actions instead.

## 5. React Query Architecture

Queries and mutations belong in the feature query layer.

Centralize:

- query keys
- queries
- mutations
- invalidation
- caching behavior
- optimistic updates where appropriate

Avoid scattering `useQuery` and `useMutation` through large page components.

## 6. API and Query Separation

These are different responsibilities:

```text
API
 ↓
HTTP / endpoint interaction

Queries
 ↓
Caching / fetching / mutations / invalidation

Hooks
 ↓
Feature state / orchestration

Components
 ↓
Presentation
```

Do not collapse all four layers into one file.

## 7. Types

Types should live close to the domain that owns them.

Use explicit domain types. Avoid `any` and unnecessary `unknown`.

Do not silence the compiler with:

- `as any`
- `@ts-ignore`
- `@ts-expect-error`

unless there is an explicitly documented exceptional reason.

Type errors should expose architectural problems rather than be buried.

## 8. Business Logic

Business logic should not live inside JSX.

Move complex business rules into feature utilities or domain hooks/services.

Prefer:

```tsx
const status = getConversationStatus(conversation);
```

over embedding complex conditions directly in JSX.

## 9. Payload Construction

Payload construction must have a clear owner.

For complex features, use the orchestration layer or a dedicated domain utility.

Components should provide values and trigger actions. They should not know API payload formats.

## 10. Forms

Small forms can remain local.

Complex forms should use a feature form hook and, where appropriate, a schema such as Zod.

Keep these concerns separated from visual components:

```text
form state
validation
transformation
payload preparation
```

## 11. Error Ownership

Errors should follow predictable ownership:

```text
API
 ↓
typed error
 ↓
query/mutation
 ↓
feature orchestration
 ↓
UI presentation
```

Avoid random `console.error(...)` calls and ad-hoc error strings scattered throughout components.

## 12. Server and Client Responsibility

Frontend architecture must never assume the client is trusted.

Do not rely on frontend validation for authorization.

Keep the following on the server:

- secrets
- authorization decisions
- sensitive business rules

Frontend validation exists primarily for UX and early feedback.
