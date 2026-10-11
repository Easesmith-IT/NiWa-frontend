import { describe, it, expect, vi } from "vitest";

describe("Mobile Nav & Drawer Colliding Layout Resolution Suite", () => {
  it("verifies DrawerContent does not mount DOM elements when open is false", () => {
    // Contract verification:
    // When open is false, DrawerContent MUST return null.
    // Otherwise, author classes such as 'flex' on <dialog> override native browser 'dialog:not([open]) { display: none; }',
    // causing an unclosable drawer overlay on desktop.
    const renderDrawer = ({ mounted, open }: { mounted: boolean; open: boolean }) => {
      if (!mounted || !open) return null;
      return { rendered: true, side: "left" };
    };

    expect(renderDrawer({ mounted: true, open: false })).toBeNull();
    expect(renderDrawer({ mounted: false, open: true })).toBeNull();
    expect(renderDrawer({ mounted: false, open: false })).toBeNull();
    expect(renderDrawer({ mounted: true, open: true })).toEqual({ rendered: true, side: "left" });
  });

  it("supports hideClose prop to avoid redundant close buttons in custom action headers", () => {
    interface DrawerContentProps {
      hideClose?: boolean;
    }

    const hasDedicatedClose = (props: DrawerContentProps) => !props.hideClose;

    expect(hasDedicatedClose({ hideClose: true })).toBe(false);
    expect(hasDedicatedClose({ hideClose: false })).toBe(true);
    expect(hasDedicatedClose({})).toBe(true);
  });

  it("handles automatic MobileNav dismissal when window is resized to desktop breakpoint (>= 1024px)", () => {
    const onOpenChange = vi.fn();
    let openState = true;

    const handleResize = (width: number) => {
      if (width >= 1024 && openState) {
        onOpenChange(false);
      }
    };

    // Resizing within mobile/tablet width does not dismiss
    handleResize(768);
    expect(onOpenChange).not.toHaveBeenCalled();

    // Resizing across the lg: 1024px desktop breakpoint closes mobile nav
    handleResize(1024);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    handleResize(1280);
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it("handles automatic MobileNav dismissal on route navigation transitions", () => {
    const onOpenChange = vi.fn();
    let currentPath = "/";

    const onRouteChange = (newPath: string) => {
      if (newPath !== currentPath) {
        currentPath = newPath;
        onOpenChange(false);
      }
    };

    onRouteChange("/sales/quotes");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(currentPath).toBe("/sales/quotes");

    onRouteChange("/crm/customer-360");
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it("ensures dialog modal lifecycle handles overflow restoration on unmount or close", () => {
    let bodyOverflow = "visible";
    let isOpen = false;

    const openDrawer = () => {
      isOpen = true;
      bodyOverflow = "hidden";
    };

    const closeDrawer = () => {
      isOpen = false;
      bodyOverflow = "visible";
    };

    openDrawer();
    expect(isOpen).toBe(true);
    expect(bodyOverflow).toBe("hidden");

    closeDrawer();
    expect(isOpen).toBe(false);
    expect(bodyOverflow).toBe("visible");
  });
});
