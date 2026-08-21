# Frontend Development Workflow Standard

## 1. Audit Before Editing

Never begin a structural refactor by immediately creating files.

First inspect:

1. current route/page
2. feature directory
3. API layer
4. query/mutation layer
5. types and mappers
6. existing hooks
7. existing components
8. current state/effect usage
9. direct HTTP usage
10. unsafe typing
11. feature-boundary violations

Record what is already compliant. Do not refactor code merely because it looks old.

## 2. Classify the Feature

Use a simple classification:

- **A: Fully compliant** - no migration required.
- **B: Partially compliant** - some layers are correct, some need extraction.
- **C: Monolithic** - substantial route/state/UI restructuring required.

Estimate complexity as small, medium, or large based on actual work rather than file count alone.

## 3. Phase Planning

Use separate phases when separation reduces risk or improves reviewability.

Typical structure for a medium feature:

### Phase A - Audit
Read-only analysis. No source changes.

### Phase B - State/Data Orchestration
Extract state, derived logic, handlers, and domain coordination.

### Phase C - UI Decomposition
Extract meaningful presentational components and reduce the route to a composition root.

For small modules, **merge B and C into one implementation phase** when doing so does not make verification or review materially worse. Quality is more important than maintaining artificial phase boundaries.

## 4. Protected Areas

Once a feature is completed and verified, treat it as protected during unrelated migrations.

Do not modify completed modules accidentally while restructuring another feature.

If a cross-feature dependency genuinely requires a change, document it and verify both features.

## 5. Implementation Order

Preferred order:

```text
Audit
  ↓
Plan ownership
  ↓
Extract orchestration
  ↓
Extract UI
  ↓
Verify behavior
  ↓
Typecheck
  ↓
Build
  ↓
Inspect diff/status
  ↓
Commit
  ↓
Push
```

## 6. Commit Discipline

Use focused commit messages that describe the architectural change, for example:

```text
refactor(feature): extract state orchestration
refactor(feature): finalize modular architecture
```

Avoid mixing unrelated fixes into a structural migration.

## 7. Strict Stop Rule

After completing a planned phase:

- report what changed
- report verification results
- report commit hash
- confirm working tree status
- stop before starting the next phase unless explicitly authorized by the workflow

This prevents accidental scope expansion and makes review checkpoints meaningful.

## 8. Small-Module Rule

Do not force every feature through the same number of phases.

If a feature is already API-compliant and only has a small page, combine orchestration and UI decomposition where practical. If it is already compliant, do nothing.

The objective is a clean, maintainable codebase, not a collection of ceremonial commits.

## 9. Refactor Scope

A refactor should change structure, not silently change product behavior.

If a bug is discovered during migration:

1. verify it is real
2. determine whether fixing it is required for safe migration
3. keep the fix isolated where possible
4. mention it explicitly in the completion report

## 10. Completion Report

Every migration report should state:

- baseline commit
- final commit
- files created/modified
- major responsibilities moved
- architecture status
- unsafe-type count
- boundary audit
- typecheck result
- build result
- behavioral preservation status
- working tree status
- protected areas respected

Do not claim behavior is preserved merely because the build passes.
