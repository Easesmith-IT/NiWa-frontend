# Frontend Code Quality and Testing Standard

## 1. TypeScript Safety

Use explicit domain types.

Avoid:

- `any`
- unnecessary `unknown`
- `as any`
- `@ts-ignore`
- `@ts-expect-error`

unless there is an explicitly documented exceptional reason.

Type errors should expose architectural problems rather than be buried.

## 2. Complexity Control

Reduce complexity when it harms comprehension or ownership.

Warning signs include:

- very large route files
- many unrelated state variables
- repeated business handlers
- large JSX trees containing multiple domains
- API calls mixed with presentation
- duplicated form logic
- components with several unrelated responsibilities

Do not use line count as the only quality metric. Decompose by responsibility.

## 3. Duplication

Remove duplicated behavior when the abstraction is clear and stable.

Do not create abstractions merely because two pieces look similar. Different domain semantics should remain separate when forcing reuse would make the design worse.

## 4. Testing Strategy

Tests should follow architectural boundaries.

### Unit tests

Prioritize pure utilities and business rules.

### Hook tests

Use for complex state orchestration.

### Component tests

Use for important reusable UI behavior.

### Integration tests

Use for feature workflows.

### E2E tests

Use for critical user journeys.

Do not attempt to E2E-test every tiny UI primitive.

## 5. Verification

A completed implementation should verify:

- functional behavior
- architectural boundaries
- type safety
- build integrity
- relevant tests
- loading/error/empty behavior
- accessibility where applicable

For projects using the standard commands, typecheck and build should pass before completion.

## 6. Refactoring Verification

Architecture-only refactors should preserve:

- user-visible behavior
- API contracts
- routes
- validation
- loading/error states
- lifecycle behavior
- responsive behavior
- theme behavior

If behavior changes are intentional, treat those changes as a separate concern and document them.

## 7. Definition of Done

A feature is not complete merely because it works.

It should satisfy four dimensions:

### Functional

It behaves correctly.

### Architectural

It follows feature and responsibility boundaries.

### Maintainability

Another developer can understand and modify it without archaeology.

### Upgradeability

Backend, UI, state management, or individual components can be changed without rewriting the entire feature.

## 8. Non-Negotiable Rule

No feature should require a monolithic page, monolithic hook, or monolithic component to function.

Every feature must have clear ownership boundaries for UI, state, data fetching, API communication, domain types, and business logic.

Reuse existing components and abstractions wherever they genuinely fit. Create new abstractions only when they establish a clear reusable boundary.
