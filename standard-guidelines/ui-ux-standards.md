# Frontend UI and Quality Standard

## 1. Component Size and Responsibility

Line count is not the primary architectural metric, but large components should trigger review.

Warning signs:

- many independent `useState` calls
- many `useEffect` calls
- many event handlers
- multiple unrelated JSX sections
- API calls
- payload construction
- validation
- business rules
- modal implementations
- large conditional rendering trees

A component around **300-400+ lines** should be reviewed for decomposition. A component approaching **700-800+ lines** is a serious architectural smell unless there is a strong documented reason.

The rule is:

> Decompose by responsibility, not merely by line count.

## 2. Hook Size

Hooks can also become monoliths.

Warning signs include a hook containing large numbers of unrelated state variables, effects, callbacks, API calls, validation, and payload construction.

Prefer focused hooks such as:

```text
useFeatureFilters
useFeatureSelection
useFeatureForm
useFeatureMedia
useFeatureWorkspace
useFeatureOrchestration
```

The orchestration hook coordinates. It should not become another monolith.

## 3. Avoid Duplicate UI

Before implementing UI:

```text
Search existing components
        ↓
Reuse
        ↓
Extend
        ↓
Generalize
        ↓
Create new component only if necessary
```

Do not copy an existing component merely because modifying the original is inconvenient. Also avoid premature abstraction.

## 4. Loading / Error / Empty States

Every data-driven feature should explicitly consider:

- Loading
- Success
- Empty
- Error
- Partial/disabled

Do not allow each component to invent inconsistent behavior. Create reusable primitives where patterns repeat.

## 5. Accessibility

Every reusable component should consider:

- keyboard navigation
- focus management
- semantic HTML
- labels
- ARIA where necessary
- visible focus states
- screen-reader behavior

Accessibility is part of component design, not a final emergency patch.

## 6. Performance

Do not optimize blindly. First maintain clean boundaries.

Then investigate:

- unnecessary renders
- expensive calculations
- large lists
- unnecessary API requests
- duplicate queries
- oversized client components

Use memoization only where it solves an identified problem.

`useMemo` is not an architectural deodorizer.

## 7. Responsive and Theme Behavior

Responsive behavior and supported themes are part of component quality. Do not introduce architecture changes that silently break existing responsive or theme behavior.

## 8. Visual Refactoring

When performing an architecture refactor without a design change, preserve visual behavior. Do not mix structural migration with unrelated redesign unless the task explicitly requires it.

## 9. Security

Frontend architecture must never assume the client is trusted. Authorization and sensitive business rules remain server responsibilities.

## 10. Error Presentation

UI should receive predictable, typed errors from the feature/data layers and present useful feedback. Avoid ad-hoc error handling scattered across presentation components.
