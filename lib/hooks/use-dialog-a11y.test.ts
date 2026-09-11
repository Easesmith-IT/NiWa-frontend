import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { trapDialogFocus, FOCUSABLE_SELECTOR } from "./use-dialog-a11y";

describe("useDialogA11y & trapDialogFocus Unit Tests", () => {
  let originalDocument: any;

  beforeEach(() => {
    originalDocument = (globalThis as any).document;
  });

  afterEach(() => {
    (globalThis as any).document = originalDocument;
  });

  it("defines standard WAI-ARIA focusable elements selector", () => {
    expect(FOCUSABLE_SELECTOR).toContain("button:not([disabled])");
    expect(FOCUSABLE_SELECTOR).toContain("input:not([disabled])");
    expect(FOCUSABLE_SELECTOR).toContain("select:not([disabled])");
    expect(FOCUSABLE_SELECTOR).toContain("textarea:not([disabled])");
    expect(FOCUSABLE_SELECTOR).toContain('[tabindex]:not([tabindex="-1"])');
  });

  it("ignores non-Tab keydown events", () => {
    const container = { querySelectorAll: vi.fn() } as any;
    const event = { key: "Enter", preventDefault: vi.fn() } as any;

    const handled = trapDialogFocus(event, container);
    expect(handled).toBe(false);
    expect(container.querySelectorAll).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("prevents default when no focusable elements exist in container", () => {
    const container = { querySelectorAll: vi.fn().mockReturnValue([]) } as any;
    const event = { key: "Tab", preventDefault: vi.fn() } as any;

    const handled = trapDialogFocus(event, container);
    expect(handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("wraps forward to first element when Tab is pressed on last element", () => {
    const firstElement = { focus: vi.fn() };
    const lastElement = { focus: vi.fn() };

    (globalThis as any).document = {
      activeElement: lastElement,
    };

    const container = {
      querySelectorAll: vi.fn().mockReturnValue([firstElement, lastElement]),
    } as any;

    const event = {
      key: "Tab",
      shiftKey: false,
      preventDefault: vi.fn(),
    } as any;

    const handled = trapDialogFocus(event, container);
    expect(handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(firstElement.focus).toHaveBeenCalled();
    expect(lastElement.focus).not.toHaveBeenCalled();
  });

  it("wraps backward to last element when Shift+Tab is pressed on first element", () => {
    const firstElement = { focus: vi.fn() };
    const lastElement = { focus: vi.fn() };

    (globalThis as any).document = {
      activeElement: firstElement,
    };

    const container = {
      querySelectorAll: vi.fn().mockReturnValue([firstElement, lastElement]),
    } as any;

    const event = {
      key: "Tab",
      shiftKey: true,
      preventDefault: vi.fn(),
    } as any;

    const handled = trapDialogFocus(event, container);
    expect(handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(lastElement.focus).toHaveBeenCalled();
    expect(firstElement.focus).not.toHaveBeenCalled();
  });

  it("wraps backward to last element when Shift+Tab is pressed on the container itself", () => {
    const firstElement = { focus: vi.fn() };
    const lastElement = { focus: vi.fn() };
    const container = {
      querySelectorAll: vi.fn().mockReturnValue([firstElement, lastElement]),
    } as any;

    (globalThis as any).document = {
      activeElement: container,
    };

    const event = {
      key: "Tab",
      shiftKey: true,
      preventDefault: vi.fn(),
    } as any;

    const handled = trapDialogFocus(event, container);
    expect(handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(lastElement.focus).toHaveBeenCalled();
  });
});
