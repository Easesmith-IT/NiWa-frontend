import { useEffect, useRef } from "react";

export interface UseDialogA11yOptions {
  isOpen: boolean;
  onClose: () => void;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

export const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps Tab and Shift+Tab key navigation within an element.
 * Returns true if the key event was trapped and handled.
 */
export function trapDialogFocus(
  e: KeyboardEvent,
  container: HTMLElement
): boolean {
  if (e.key !== "Tab") return false;

  const focusable = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  );

  if (focusable.length === 0) {
    e.preventDefault();
    return true;
  }

  const firstElement = focusable[0];
  const lastElement = focusable[focusable.length - 1];
  const activeEl = document.activeElement;

  if (e.shiftKey) {
    if (activeEl === firstElement || activeEl === container) {
      e.preventDefault();
      lastElement.focus();
      return true;
    }
  } else {
    if (activeEl === lastElement) {
      e.preventDefault();
      firstElement.focus();
      return true;
    }
  }

  return false;
}

/**
 * Custom hook providing robust, zero-dependency WAI-ARIA Dialog focus management:
 * 1. Initial focus shift to initialFocusRef or first focusable control
 * 2. Focus restoration to trigger element on close
 * 3. Tab and Shift+Tab focus trapping within the dialog container
 * 4. Escape key dismissal
 */
export function useDialogA11y<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onClose,
  initialFocusRef,
}: UseDialogA11yOptions) {
  const dialogRef = useRef<T>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Remember triggering element to restore focus on close
    triggerRef.current = document.activeElement as HTMLElement | null;

    const dialogEl = dialogRef.current;
    if (!dialogEl) return;

    // 2. Set initial focus into dialog
    const focusTimer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        const focusable = dialogEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          dialogEl.focus();
        }
      }
    }, 40);

    // 3. Trap keyboard navigation & handle Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        trapDialogFocus(e, dialogRef.current);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      // 4. Restore focus on close
      if (triggerRef.current && typeof triggerRef.current.focus === "function") {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose, initialFocusRef]);

  return dialogRef;
}
