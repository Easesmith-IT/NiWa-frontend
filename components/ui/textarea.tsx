import { forwardRef, TextareaHTMLAttributes } from "react";

import { cn } from "../../lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-24 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground transition-colors focus:border-focus focus:ring-2 focus:ring-focus/15 disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-foreground-disabled",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";

