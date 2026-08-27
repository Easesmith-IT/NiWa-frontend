"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

interface DrawerContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  hasTitle: boolean;
  setHasTitle: (hasTitle: boolean) => void;
  hasDescription: boolean;
  setHasDescription: (hasDescription: boolean) => void;
}

const DrawerContext = createContext<DrawerContextValue | undefined>(undefined);

export function useDrawerContext() {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("Drawer components must be used within a Drawer");
  }
  return context;
}

export function Drawer({
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  
  const onOpenChange = useCallback((newOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(newOpen);
    }
    if (controlledOnOpenChange) {
      controlledOnOpenChange(newOpen);
    }
  }, [isControlled, controlledOnOpenChange]);

  return (
    <DrawerContext.Provider value={{ open, onOpenChange, titleId, descriptionId, hasTitle, setHasTitle, hasDescription, setHasDescription }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function DrawerTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const { onOpenChange } = useDrawerContext();
  
  const handleClick = (e: React.MouseEvent) => {
    onOpenChange(true);
    if (React.isValidElement<{ onClick?: (e: React.MouseEvent) => void }>(children) && children.props.onClick) {
      children.props.onClick(e);
    }
  };

  if (asChild && React.isValidElement<{ onClick?: (e: React.MouseEvent) => void }>(children)) {
    return React.cloneElement(children, { onClick: handleClick });
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
}

export function DrawerClose({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const { onOpenChange } = useDrawerContext();
  
  const handleClick = (e: React.MouseEvent) => {
    onOpenChange(false);
    if (React.isValidElement<{ onClick?: (e: React.MouseEvent) => void }>(children) && children.props.onClick) {
      children.props.onClick(e);
    }
  };

  if (asChild && React.isValidElement<{ onClick?: (e: React.MouseEvent) => void }>(children)) {
    return React.cloneElement(children, { onClick: handleClick });
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
}

export function DrawerContent({
  children,
  className,
  onInteractOutside,
  side = "right",
}: {
  children: React.ReactNode;
  className?: string;
  onInteractOutside?: (e: Event) => void;
  side?: "right" | "bottom";
}) {
  const { open, onOpenChange, titleId, descriptionId, hasTitle, hasDescription } = useDrawerContext();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = useState(false);
  const overflowStateRef = useRef<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        overflowStateRef.current = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = "hidden";
      }
    } else {
      if (dialog.open) {
        dialog.close();
        document.body.style.overflow = overflowStateRef.current;
      }
    }
  }, [open]);

  // Unmount cleanup
  useEffect(() => {
    return () => {
      const dialog = dialogRef.current;
      if (dialog && dialog.open) {
        dialog.close();
        document.body.style.overflow = overflowStateRef.current;
      }
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onOpenChange(false);
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onOpenChange]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClick = (e: MouseEvent) => {
      if (e.target === dialog) {
        if (onInteractOutside) {
          onInteractOutside(e);
          if (e.defaultPrevented) return;
        }
        onOpenChange(false);
      }
    };

    dialog.addEventListener("click", handleClick);
    return () => dialog.removeEventListener("click", handleClick);
  }, [onOpenChange, onInteractOutside]);

  if (!mounted) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={hasTitle ? titleId : undefined}
      aria-describedby={hasDescription ? descriptionId : undefined}
      className={cn(
        "backdrop:bg-black/50 backdrop:backdrop-blur-sm",
        "fixed m-0 bg-surface p-0 text-foreground shadow-modal border-border overflow-y-auto outline-none",
        "open:animate-in open:fade-in-0",
        side === "right" 
          ? "inset-y-0 right-0 h-full w-3/4 max-w-md border-l open:slide-in-from-right-full"
          : "inset-x-0 bottom-0 mt-auto h-auto max-h-[90vh] w-full border-t rounded-t-xl open:slide-in-from-bottom-full",
        className
      )}
    >
      <div className="relative p-6">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-surface transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </dialog>,
    document.body
  );
}

export function DrawerHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-left mb-6 pr-6", className)}
      {...props}
    />
  );
}

export function DrawerFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

export function DrawerTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const { titleId, setHasTitle } = useDrawerContext();
  
  useEffect(() => {
    setHasTitle(true);
    return () => setHasTitle(false);
  }, [setHasTitle]);

  return (
    <h2
      id={titleId}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export function DrawerDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId, setHasDescription } = useDrawerContext();
  
  useEffect(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [setHasDescription]);

  return (
    <p
      id={descriptionId}
      className={cn("text-sm text-foreground-secondary", className)}
      {...props}
    />
  );
}
