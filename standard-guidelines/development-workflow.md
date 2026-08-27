# Frontend Development and Refactoring Workflow Standard

## 1. Migration / Refactoring Rule

When working on an existing monolith, do not mix every structural change together.

Use controlled phases when they reduce risk:

```text
A → Audit
B → Types + API + Queries
C → State orchestration
D → UI decomposition
E → Cleanup + verification
```

The objective is to build the architecture correctly from the beginning so migration phases are rarely needed for new work.

## 2. Mandatory Pre-Implementation Audit

Before implementing a substantial feature:

1. Inspect the existing architecture.
2. Search for reusable components.
3. Search for existing hooks.
4. Search for existing API functions.
5. Search for existing query patterns.
6. Search for existing domain types.
7. Identify duplicated functionality.
8. Identify expected state ownership.
9. Identify API boundaries.
10. Define the feature structure before writing substantial JSX.

Do not refactor code merely because it looks old. First determine what already satisfies the standard.

## 3. Implementation Order

Use this sequence when it improves safety and reviewability:

```text
Audit
  ↓
Plan ownership
  ↓
Types / API / Queries
  ↓
State orchestration
  ↓
UI decomposition
  ↓
Cleanup
  ↓
Verification
```

For a feature that is already compliant, do nothing. For a small feature, phases may be combined when separation would add ceremony without reducing risk.

## 4. Mandatory Implementation Checklist

Before considering a feature complete:

```text
[ ] Feature has a clear boundary
[ ] Page is a composition root
[ ] UI is componentized
[ ] Shared components reused where appropriate
[ ] No unnecessary duplicate components
[ ] State has clear ownership
[ ] Complex state lives in hooks
[ ] API calls are isolated
[ ] React Query is isolated
[ ] Query keys are centralized
[ ] Types are explicit
[ ] No unnecessary any
[ ] No ignored TypeScript errors
[ ] Business logic is outside JSX
[ ] Payload construction has one owner
[ ] Loading state exists
[ ] Error state exists
[ ] Empty state exists
[ ] Accessibility considered
[ ] Responsive behavior considered
[ ] Dark/light theme considered where applicable
[ ] Typecheck passes
[ ] Build passes
[ ] Relevant tests pass
[ ] Git diff reviewed
[ ] No unrelated files modified
```

## 5. Protected Boundaries

During unrelated migrations, completed features should remain untouched.

If a cross-feature change is genuinely required, document the dependency and verify the affected features together.

## 6. Completion Standard

A feature is complete only when it is:

- functionally correct
- architecturally compliant
- maintainable
- upgradeable

Do not declare completion solely because the application builds.

## 7. Verification

After structural changes, verify behavior and architecture, then run the project's typecheck, build, and relevant tests.

Review the final diff and confirm no unrelated files were changed.

## 8. Existing-Code Refactoring Principle

Refactoring should change structure without silently changing product behavior.

If a behavioral bug is discovered during migration, verify it, determine whether the fix is required for safe migration, keep the fix isolated where possible, and report it explicitly.
