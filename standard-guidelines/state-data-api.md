# State, Data and API Standard

## 1. API Ownership

HTTP access belongs in the feature data-access layer.

Preferred:

```text
feature.api.ts
    ↓
feature.queries.ts
    ↓
feature orchestration
    ↓
feature components
```

Routes and presentational components should not call `fetch`, `axios`, or the application's API client directly.

## 2. React Query Ownership

Query and mutation definitions should live in the feature query layer.

Do not create ad-hoc `useQuery` or `useMutation` calls inside a large page component when the operation belongs to the feature domain.

Centralize:

- query keys
- API invocation
- mutation behavior
- cache invalidation
- standard query options where appropriate

## 3. State Ownership

Classify state before deciding where it belongs.

| State | Preferred owner |
|---|---|
| Server data | Query/cache layer |
| Domain interaction state | Feature orchestration hook |
| Form draft | Feature orchestration or dedicated form hook |
| Small local visual state | Component |
| Global application state | Shared/global store only when genuinely global |

Do not duplicate server state into local state without a clear reason.

## 4. Derived State

Prefer deriving values from existing state/data rather than maintaining duplicate state.

Use `useMemo` only when the derivation is meaningful or computationally expensive enough to justify it. Do not memoize everything because React developers enjoy making simple things complicated.

## 5. Effects

Use `useEffect` for synchronization with external systems, not as a general-purpose place to run business logic.

Before adding an effect, ask whether the behavior can instead be expressed as:

- derived state
- an event handler
- a query/mutation lifecycle
- a callback
- server-side logic

## 6. Forms and Mutations

Mutation handlers should coordinate the complete operation:

1. validate/prepare input
2. submit mutation
3. handle success
4. invalidate/update relevant data
5. reset appropriate state
6. expose useful feedback
7. handle errors safely

Do not leave half of the workflow inside JSX and the other half inside an API function.

## 7. Error Handling

Never use `any` merely to make error handling compile.

Use available type guards or narrow unknown values safely. Error messages should be useful to the user and sufficiently structured for debugging.

## 8. API Types

Keep API/domain types explicit.

Prefer:

```ts
interface ContactRecord {
  id: string;
  displayName: string;
}
```

over loosely typed objects.

Map external API representations into domain representations when the API shape should not leak throughout the UI.

## 9. Cache and Invalidation

When mutations change server data, identify the affected query/cache entries explicitly. Avoid broad, unnecessary invalidation when a targeted update is possible.

## 10. Navigation

Navigation caused by a domain action may be coordinated by the feature orchestration layer. The UI component should communicate intent rather than contain a large navigation/business workflow.

## 11. Data Ownership Audit

For every feature, be able to answer:

- Where does data come from?
- Where is it transformed?
- Where is it cached?
- Where is mutable UI state stored?
- Where are mutations defined?
- Where are errors handled?
- Who owns lifecycle transitions?

If those answers are spread across several unrelated files without a clear reason, the feature needs architectural cleanup.
