import { forwardRef, InputHTMLAttributes } from "react";

import { cn } from "../../lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[hsl(var(--focus))] focus:ring-2 focus:ring-[hsl(var(--focus))]/15",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
