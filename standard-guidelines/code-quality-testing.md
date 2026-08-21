# Code Quality and Testing Standard

## 1. TypeScript Safety

The default standard is strict typing.

Avoid:

- `any`
- `as any`
- `unknown as SomeType` used to bypass type checking
- `@ts-ignore`
- `@ts-expect-error` unless there is a documented, unavoidable compiler limitation

Prefer type guards, explicit interfaces, discriminated unions, generics, and safe narrowing.

## 2. Complexity Control

Complexity should be reduced when it harms comprehension or ownership.

Warning signs include:

- very large route files
- many unrelated `useState` values
- repeated business handlers
- large JSX trees containing multiple domains
- direct API calls mixed with presentation
- duplicated form logic
- components with several unrelated responsibilities

Do not use line count as the only quality metric. A 200-line coherent component can be better than ten meaningless 20-line components.

## 3. Duplication

Remove duplicated behavior when the abstraction is clear and stable. Avoid premature abstraction when two pieces only look similar but have different domain semantics.

## 4. Verification Requirements

A completed code change should normally pass:

```bash
npm run typecheck
npm run build
```

For behavior-sensitive changes, also perform targeted checks relevant to the feature.

Before completion verify:

- no unintended files changed
- no unsafe typing introduced
- no feature-boundary violations
- no direct HTTP calls leaked into UI
- no duplicate query/mutation definitions were introduced
- intended behavior remains intact

## 5. Refactoring Verification

Architecture-only refactors must preserve:

- user-visible behavior
- routes
- API contracts
- loading/error states
- validation
- lifecycle actions
- responsive behavior
- theme behavior

If behavior changes are intended, document them separately from the structural refactor.

## 6. Build and Typecheck Are Not Enough

A successful build proves that the project can compile/build. It does not prove that the feature is correct.

Review the actual use cases and interaction paths after structural changes.

## 7. Code Review Checklist

Reviewers should check:

### Architecture
- Is ownership clear?
- Is the route thin enough to be understandable?
- Are feature boundaries respected?
- Are abstractions justified?

### State and data
- Is state owned at the correct level?
- Are server state and UI state separated?
- Are mutations and cache invalidation correct?

### UI
- Is the UI consistent with existing patterns?
- Are loading, empty, error, and disabled states handled?
- Is responsive behavior preserved?

### Safety
- Are types strict?
- Are destructive actions handled safely?
- Is user input validated?

### Regression
- Were existing behaviors preserved?
- Were unrelated modules left untouched?

## 8. Definition of Done

A feature/refactor is complete when:

- architecture matches the applicable standard
- implementation is behaviorally verified
- typecheck passes
- build passes
- relevant targeted checks pass
- working tree is clean
- changes are committed with a meaningful message
- the commit is pushed when the workflow requires it
