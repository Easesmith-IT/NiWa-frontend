# Standard Frontend Guidelines

These documents define the default frontend engineering standard for Easesmith projects. They are **project-independent** and should be treated as the baseline unless a project has an explicit, documented exception.

## Documents

- `frontend-architecture.md` - feature boundaries, route composition, component decomposition, and dependency direction.
- `ui-ux-standards.md` - reusable UI, responsive behavior, visual consistency, accessibility, and interaction quality.
- `state-data-api.md` - state ownership, API/query separation, forms, async flows, and data boundaries.
- `code-quality-testing.md` - TypeScript safety, complexity control, verification, regression prevention, and review criteria.
- `development-workflow.md` - audit-first implementation, phased refactoring, Git discipline, and completion criteria.

## Core Principles

1. **Feature-first architecture:** domain code lives with its feature, not in route files.
2. **Thin route composition:** route/page files should primarily connect orchestration to presentation.
3. **Single ownership:** every piece of state, API access, and business rule should have one clear owner.
4. **Composition over monoliths:** split large screens into meaningful components, not arbitrary fragments.
5. **Strict typing:** avoid `any`, unsafe casts, and suppression comments.
6. **Reuse before duplication:** prefer shared primitives and domain components when the abstraction is genuinely reusable.
7. **Behavior before refactoring:** preserve existing behavior unless the task explicitly changes it.
8. **Verify before declaring complete:** typecheck, build, targeted checks, and Git status are part of the implementation, not optional cleanup.
9. **Small modules can be merged into one implementation phase:** phase boundaries exist to control risk, not to create ceremony.
10. **No speculative architecture:** do not add abstractions, libraries, or layers without a demonstrated need.

## Scope

These guidelines apply to new development, refactoring, code review, and architecture audits across projects. Project-specific requirements may extend these rules but should not silently weaken them.
