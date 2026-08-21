# UI/UX Standard

## 1. Visual Consistency

Use the project's established design system instead of inventing page-specific styles.

Maintain consistency for:

- typography hierarchy
- spacing scale
- border radius
- buttons and controls
- form fields
- cards and panels
- status badges
- icons
- shadows and elevation
- light/dark themes where supported

A new feature should look like it belongs to the product.

## 2. Component Reuse

Prefer existing shared UI primitives before creating new ones.

Before adding a component, check whether an existing component can be reused or extended without making its API confusing.

Do not duplicate the same visual pattern across multiple pages.

## 3. Responsive Design

Every user-facing screen must be considered at:

- mobile
- tablet
- desktop
- large desktop where relevant

Do not rely on desktop-only layouts and assume CSS will magically save them. Humans have been disappointed by this approach for decades.

Tables, drawers, modals, forms, navigation, and action toolbars require explicit responsive behavior.

## 4. Interaction Quality

Important actions should provide clear feedback:

- loading state
- disabled state where appropriate
- success feedback
- useful error feedback
- empty state
- skeleton/loading presentation for data-heavy screens
- confirmation for destructive actions when appropriate

Avoid silent failures.

## 5. Forms

Forms should:

- use clear labels
- validate required fields
- preserve useful input when possible after recoverable errors
- disable duplicate submission while submitting
- show field-level errors when useful
- reset only when the operation succeeds or when explicitly intended

Do not bury business rules inside JSX event handlers when they belong in orchestration/domain logic.

## 6. Data-Heavy Screens

For registries and dashboards, provide deliberate handling for:

- loading
- empty results
- search/filter states
- pagination or large datasets where required
- errors
- selection state
- row/card actions

Avoid rendering a large screen as one undifferentiated block.

## 7. Accessibility

Use semantic HTML and accessible controls.

Ensure:

- buttons are real buttons
- links are real links
- inputs have labels
- dialogs have appropriate semantics
- keyboard navigation works for interactive UI
- focus behavior is sensible
- color is not the only indicator of state
- contrast remains readable in supported themes

## 8. Dark Mode and Themes

Theme support must be intentional. Do not hard-code colors that break an existing theme.

When modifying an existing screen, preserve its established theme behavior unless the task explicitly changes the design.

## 9. Visual Refactoring Rule

When refactoring architecture without a design change:

**behavior and visual appearance must remain stable.**

Do not mix a large architecture refactor with an unrelated redesign. Separate concerns so regressions can be identified.

## 10. Avoid Cosmetic Overengineering

Do not add animations, gradients, shadows, abstractions, or decorative elements merely because they are available. Visual decisions must improve usability or communicate hierarchy.
