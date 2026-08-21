# Frontend Architecture Standard

## 1. Feature-Oriented Structure

Organize application code around business capabilities rather than around technical file types alone.

```text
app/
  (app)/
    <route>/page.tsx          # thin route composition

features/
  <feature>/
    <feature>.api.ts          # HTTP/data-access functions
    <feature>.queries.ts      # React Query/query-mutation definitions
    <feature>.types.ts        # domain types
    <feature>.mappers.ts      # API-to-domain mapping when required
    hooks/                    # domain state and orchestration
    components/               # feature presentation
    index.ts                  # intentional public boundary
```

The exact framework directory names may differ, but the ownership model should remain the same.

## 2. Route/Page Responsibility

A route should be a composition root, not the home of business logic.

Preferred pattern:

```tsx
export default function Page() {
  const orchestration = useFeatureOrchestration();
  return <FeatureShell orchestration={orchestration} />;
}
```

Avoid putting the following directly in a large route file:

- multiple unrelated `useState` calls
- API calls
- mutation definitions
- business rules
- large form handlers
- lifecycle handlers
- duplicated UI sections
- large tables/cards/modals

A route may contain small route-specific composition when extracting it would make the architecture worse. The goal is clarity, not a magical six-line limit.

## 3. Orchestration Ownership

Domain state and behavior should be owned by a feature hook such as `useFeatureOrchestration`.

The orchestration layer may own:

- UI/domain state
- derived state
- form state
- event handlers
- mutation coordination
- success/error handling
- reset behavior
- lifecycle transitions
- navigation caused by domain actions

It should not become a second giant component. If an orchestration hook becomes too large, split it by domain responsibility.

## 4. Component Decomposition

Create components around meaningful responsibilities:

- page shell/layout
- header/toolbar
- create/edit form
- registry/list
- item/card
- detail drawer
- modal/dialog
- domain-specific editor

Do **not** split every few lines into a component merely to satisfy a metric. A component should have a coherent responsibility and a useful interface.

## 5. Dependency Direction

The dependency direction should generally be:

```text
Route
  ↓
Feature orchestration + feature components
  ↓
Feature query/data layer
  ↓
Shared API/client infrastructure
```

Feature code must not import application route implementations. Avoid circular dependencies between feature modules.

## 6. Public Boundaries

Use the feature `index.ts` as the intentional public export boundary when practical. Avoid deep imports into another feature's internal implementation unless there is a strong architectural reason.

## 7. Shared vs Feature-Specific Code

Put code in shared infrastructure only when it is genuinely reusable across multiple features.

Keep code inside the feature when it contains domain-specific behavior. Do not create a `utils` dumping ground for unrelated business logic.

## 8. Architecture Refactoring Rule

Before modifying a feature:

1. inspect the route
2. inspect API/data access
3. inspect query/mutation ownership
4. inspect existing components and hooks
5. inventory states and effects
6. identify business handlers
7. identify unsafe typing and boundary violations
8. determine the smallest safe migration plan

Do not refactor from filenames alone. Existing abstractions may already satisfy the standard.
