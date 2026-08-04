---
version: alpha
name: NiWa Design System
description: The governing design system and visual language for the NiWa WhatsApp Business Operations Platform.
colors:
  background: "hsl(42 20% 96%)"
  foreground: "hsl(158 18% 14%)"
  card: "hsl(0 0% 100%)"
  card-foreground: "hsl(158 18% 14%)"
  primary: "hsl(154 38% 24%)"
  primary-foreground: "hsl(48 33% 97%)"
  muted: "hsl(42 18% 92%)"
  muted-foreground: "hsl(158 10% 38%)"
  border: "hsl(38 14% 84%)"
  input: "hsl(38 14% 84%)"
  accent: "hsl(150 20% 93%)"
  accent-foreground: "hsl(158 18% 14%)"
  success: "hsl(145 45% 32%)"
  warning: "hsl(35 70% 46%)"
  danger: "hsl(8 65% 45%)"
  info: "hsl(198 52% 42%)"
  focus: "hsl(154 55% 34%)"
typography:
  sans:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
  mono:
    fontFamily: JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
rounded:
  base: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container: 1.5rem
---

# NiWa Design System Documentation

## Overview

The **NiWa Design Language** governs the user interface of the NiWa WhatsApp Business Operations Platform. Built for real-time customer communication, operator efficiency, and high-signal data density, it combines a warm, organic Sage & Cream color palette with modern glassmorphism, crisp typography, and purposeful micro-interactions.

---

## 1. Color System & Roles

NiWa uses a tailored HSL color system that avoids generic browser neutrals, grounding the workspace in natural, calm tones suitable for long operator shifts.

### Primary Palette
* **Primary (`--primary` / `hsl(154 38% 24%)`):** Rich Forest Sage. Used for active navigation items, primary call-to-action buttons, and high-importance badges.
* **Background (`--background` / `hsl(42 20% 96%)`):** Warm Sand Cream (`#f7f5f0`). Reduces eye strain compared to harsh stark white backgrounds.
* **Card (`--card` / `hsl(0 0% 100%)`):** Pure White (`#ffffff`) with 78% opacity backdrop blur.
* **Border (`--border` / `hsl(38 14% 84%)`):** Subtle Cream-Grey Border (`#dcd6c9`).

### Telemetry Status Colors
* **Read / Seen Status:** WhatsApp Cyan Blue (`#34b7f1`) for double-check read receipts (`CheckCheck`).
* **Delivered Status:** Soft Muted Grey-Green (`#7a8b82`) for double-check delivery receipts.
* **Success / Online:** Emerald Green (`hsl(145 45% 32%)`).
* **Warning / Overdue:** Amber Gold (`hsl(35 70% 46%)`).
* **Danger / Failure:** Crimson Red (`hsl(8 65% 45%)`).

---

## 2. Typography

NiWa uses **Inter** for clean UI readability and **JetBrains Mono** for technical telemetry (Meta Message IDs, Webhook endpoints, and timestamps).

### Typography Scale
* **Display / Hero Titles:** `text-3xl` (`1.875rem` / `30px`), `font-bold` or `font-semibold`, `tracking-tight`.
* **Section Headings:** `text-lg` (`1.125rem` / `18px`), `font-semibold`.
* **Body Text:** `text-sm` (`0.875rem` / `14px`), `font-normal` or `font-medium`, `line-height: 1.5`.
* **Sub-labels & Meta Details:** `text-xs` (`0.75rem` / `12px`), `font-medium`, `text-muted-foreground`.
* **Monospace Telemetry:** `font-mono`, `text-xs`, `tracking-normal`.

---

## 3. Layout & Ergonomics

### The AppShell Container
* **Flexbox Chaining:** The root shell uses `flex flex-col flex-1 min-h-0 h-full overflow-hidden`.
* **No Hardcoded Magic Offsets:** Avoid `h-[calc(100vh-6.75rem)]`. Child views occupy `h-full min-h-0 flex-1` so the workspace adjusts dynamically to any screen height without dual scrollbars.
* **Navigation Sidebar:** Fixed width (`236px` expanded, `72px` collapsed) with smooth CSS transitions (`duration-200 ease-out`).

---

## 4. Elevation & Depth

* **Soft Ambient Shadows:** Custom `--shadow-soft: 0 20px 48px rgba(31, 41, 35, 0.08)`.
* **Borders:** Thin `1px` borders (`border-border/60` or `border-white/70`).
* **Backdrop Blur:** `backdrop-blur-md` (`12px` - `16px` blur) on topbars, modals, and sticky headers.

---

## 5. Component Patterns

### Buttons & Pill Controls
* **Primary Button:** `rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium`.
* **Ghost / Subdued Button:** `rounded-full border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground`.
* **Active Filter Pill:** `rounded-full bg-primary text-primary-foreground shadow-sm`.

### Message Bubbles
* **Outbound Messages (Sent by Business):** `bg-accent/70 border border-emerald-200/50 text-foreground rounded-2xl rounded-tr-xs p-3.5`.
* **Inbound Messages (Sent by Customer):** `bg-card border border-border/70 text-foreground rounded-2xl rounded-tl-xs p-3.5 shadow-xs`.

---

## 6. Do's and Don'ts

### Do's
* **DO** use semantic design tokens (`bg-background`, `bg-card`, `bg-muted`, `border-border`, `text-foreground`, `text-muted-foreground`).
* **DO** use `CheckCheck` in cyan-blue (`#34b7f1`) exclusively for `read`/`seen` WhatsApp status receipts.
* **DO** ensure image avatars have error fallback handlers (`onError`) to display initial badges when CDN links fail.
* **DO** wrap Lucide icons inside `<span title="...">` when adding tooltip text attributes.

### Don'ts
* **DON'T** use hardcoded arbitrary hex colors (`#f6f1e9`, `#25342f`, `#ddd2c3`) in component files.
* **DON'T** apply fixed pixel height offsets (`h-[calc(100vh-...)]`) that trigger dual scrollbars inside `AppShell`.
* **DON'T** use zero-blur block shadows (`box-shadow: 4px 4px 0`) or heavy left border callouts (`border-l-4`).
* **DON'T** use raw text eyebrows above page titles.
