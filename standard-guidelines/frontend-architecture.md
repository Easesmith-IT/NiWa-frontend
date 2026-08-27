# Frontend Architecture Standard

## 1. Architecture Model

Use **Feature-Oriented Modular Architecture with Component-Based UI**.

Organize code by business feature while separating responsibilities by layer.

```text
app/
├── routes/
│   └── feature-page/
│       └── page.tsx
│
features/
├── feature-name/
│   ├── components/
│   ├── hooks/
│   ├── feature-name.api.ts
│   ├── feature-name.queries.ts
│   ├── feature-name.types.ts
│   ├── feature-name.utils.ts
│   ├── feature-name.constants.ts
│   └── index.ts
│
components/
├── ui/
├── layout/
└── shared/
│
lib/
├── api/
├── auth/
├── utils/
└── ...
```

Feature-oriented architecture determines **where code belongs**. Component-based architecture determines **how UI is constructed**. They are complementary.

## 2. Route/Page Responsibility

A page should primarily be a **composition root**.

It may:

- initialize the feature
- connect feature hooks
- connect queries/mutations
- compose major components
- handle route-level concerns

It should not become the home for state, API calls, business logic, validation, and large JSX simply because those things were not organized elsewhere.

Preferred:

```tsx
export default function Page() {
  const feature = useFeatureOrchestration();

  return (
    <FeatureShell>
      <FeatureHeader {...feature.header} />
      <FeatureContent {...feature.content} />
    </FeatureShell>
  );
}
```

## 3. Feature-Oriented Structure

Every meaningful business domain should have its own feature boundary.

A feature owns its:

- components
- state
- hooks
- API layer
- queries
- types
- feature utilities

A feature should be removable without requiring surgery across unrelated features.

## 4. Component-Based UI

Decompose UI according to **responsibility**, not arbitrary line counts.

Example:

```text
FeatureShell
├── FeatureHeader
├── FeatureToolbar
├── FeatureSidebar
├── FeatureContent
│   ├── ItemList
│   ├── Item
│   └── ItemDetails
└── FeatureActions
```

A component should generally have:

- one clear visual responsibility
- explicit props
- no unnecessary global knowledge
- no direct API ownership
- no duplicated business logic

## 5. Reuse Before Creating

Before creating a component:

1. Search shared UI components.
2. Search shared components.
3. Search the current feature.
4. Search other features for an existing reusable implementation.
5. Determine whether an existing component can be generalized safely.

Prefer reusable primitives such as inputs, buttons, cards, modals, data tables, empty states, and confirmation dialogs when they genuinely fit.

Do not force unrelated UI into a generic component merely to reduce file count. Reuse should improve consistency and maintainability, not create a God Component.

## 6. Shared Component Promotion

Promote a component to shared infrastructure when:

- it is genuinely reusable
- its API is stable
- its behavior is not feature-specific
- multiple features benefit from it

Feature-specific business behavior should remain feature-owned.

## 7. State Architecture Boundary

Separate state by responsibility. UI state may remain local when small. Feature state and complex orchestration belong in feature hooks.

Avoid one giant hook containing every state variable in a feature. Prefer domain-focused hooks coordinated by an orchestration hook when complexity requires it.

## 8. Dependency Direction

Keep dependencies flowing inward:

```text
Page
 ↓
Feature Components
 ↓
Feature Hooks
 ↓
Feature Queries
 ↓
Feature API
 ↓
Backend
```

Shared primitives must not depend on feature-specific code.

## 9. Feature Isolation

Do not scatter feature logic across unrelated pages, shared folders, random hooks, or other features.

Feature boundaries are a primary mechanism for keeping future upgrades cheap.

## 10. Constants and Utilities

Do not scatter repeated magic values through JSX. Use a feature constants module for supported modes, status values, configuration values, limits, and static mappings.

Use feature utilities for pure, deterministic functions such as formatting, payload construction, calculations, response mapping, and display-name derivation.

Utilities should not secretly perform network operations or mutate unrelated state.
