# Frontend Engineering Standard

## Feature-Oriented Modular Architecture with Component-Based UI

This directory contains the **project-independent frontend engineering standard** derived from the approved frontend rules. It is intended to be the default standard for future frontend projects, not a NiWa-specific implementation guide.

> Organize code by business feature, keep responsibilities separated by layer, build UI from reusable components, and keep every module small enough to understand, test, debug, replace, and upgrade independently.

## Standard documents

- [`frontend-architecture.md`](./frontend-architecture.md) - architecture model, routes, features, components, reuse, dependency direction, and feature isolation.
- [`state-data-api.md`](./state-data-api.md) - state, effects, APIs, queries, types, business logic, payloads, and forms.
- [`ui-ux-standards.md`](./ui-ux-standards.md) - component quality, loading/error/empty states, accessibility, performance, security, and error handling.
- [`code-quality-testing.md`](./code-quality-testing.md) - complexity, duplication, testing strategy, verification, and definition of done.
- [`development-workflow.md`](./development-workflow.md) - audit-first development and controlled refactoring phases.

## Canonical architecture

```text
APPLICATION
│
├── ROUTES
│   └── composition roots
│
├── FEATURES
│   └── business-domain boundaries
│       ├── components/
│       ├── hooks/
│       ├── feature.api.ts
│       ├── feature.queries.ts
│       ├── feature.types.ts
│       ├── feature.utils.ts
│       ├── feature.constants.ts
│       └── index.ts
│
├── SHARED
│   ├── ui/
│   ├── layout/
│   └── shared components
│
└── LIB
    ├── api/
    ├── auth/
    └── generic utilities
```

Feature-oriented architecture determines **where code belongs**. Component-based architecture determines **how UI is constructed**. They are complementary.

## Non-negotiable rule

No feature should require a monolithic page, monolithic hook, or monolithic component to function.

Every feature should have clear ownership boundaries for UI, state, data fetching, API communication, domain types, and business logic.

Reuse existing components and abstractions wherever they genuinely fit. Create new abstractions only when they establish a clear reusable boundary.

## Applicability

These rules apply to new frontend development, architecture reviews, and refactoring across projects. Project-specific requirements may extend the standard, but should not silently weaken its architectural principles.
