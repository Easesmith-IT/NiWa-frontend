import { forwardRef, InputHTMLAttributes } from "react";

import { cn } from "../../lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-9.5 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground transition-colors focus:border-focus focus:ring-2 focus:ring-focus/15 disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-foreground-disabled",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";

