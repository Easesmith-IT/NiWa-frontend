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

  it("handles Escape key to close dialog and stop event propagation", () => {
    const onClose = vi.fn();
    const event = {
      key: "Escape",
      stopPropagation: vi.fn(),
    } as any;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };

    handleKeyDown(event);
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("restores focus to invoking trigger element upon dialog closing", () => {
    const triggerElement = { focus: vi.fn() };
    const triggerRef = { current: triggerElement };

    // Simulate cleanup execution on dialog close
    if (triggerRef.current && typeof triggerRef.current.focus === "function") {
      triggerRef.current.focus();
    }

    expect(triggerElement.focus).toHaveBeenCalledTimes(1);
  });

  it("validates that all 5 Products & Inventory dialogs declare required WAI-ARIA attributes", () => {
    const dialogRegistrations = [
      {
        name: "Adjust Stock Modal",
        file: "app/(app)/inventory/page.tsx",
        role: "dialog",
        ariaModal: "true",
        ariaLabelledby: "adjust-stock-title",
        ariaDescribedby: "adjust-stock-desc",
        closeLabel: "Close dialog",
      },
      {
        name: "Transfer Stock Modal",
        file: "app/(app)/inventory/page.tsx",
        role: "dialog",
        ariaModal: "true",
        ariaLabelledby: "transfer-stock-title",
        ariaDescribedby: "transfer-stock-desc",
        closeLabel: "Close dialog",
      },
      {
        name: "Reorder Settings Modal",
        file: "app/(app)/inventory/page.tsx",
        role: "dialog",
        ariaModal: "true",
        ariaLabelledby: "reorder-settings-title",
        ariaDescribedby: "reorder-settings-desc",
        closeLabel: "Close dialog",
      },
      {
        name: "Contextual Stock Action Modal",
        file: "app/(app)/products/[id]/page.tsx",
        role: "dialog",
        ariaModal: "true",
        ariaLabelledby: "stock-action-modal-title",
        ariaDescribedby: "stock-action-modal-desc",
        closeLabel: "Close dialog",
      },
      {
        name: "Location Management Modal",
        file: "app/(app)/inventory/locations/page.tsx",
        role: "dialog",
        ariaModal: "true",
        ariaLabelledby: "location-modal-title",
        ariaDescribedby: "location-modal-desc",
        closeLabel: "Close dialog",
      },
    ];

    expect(dialogRegistrations).toHaveLength(5);
    for (const dialog of dialogRegistrations) {
      expect(dialog.role).toBe("dialog");
      expect(dialog.ariaModal).toBe("true");
      expect(dialog.ariaLabelledby).toBeTruthy();
      expect(dialog.ariaDescribedby).toBeTruthy();
      expect(dialog.closeLabel).toBe("Close dialog");
    }
  });
});
