import { forwardRef, TextareaHTMLAttributes } from "react";

import { cn } from "../../lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-28 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
