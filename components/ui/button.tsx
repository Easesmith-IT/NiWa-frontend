import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-[hsl(var(--focus))] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active shadow-xs",
        secondary: "border border-border bg-surface-secondary text-foreground hover:bg-surface-hover shadow-xs",
        ghost: "text-foreground-secondary hover:bg-surface-tertiary hover:text-foreground",
        destructive: "bg-[hsl(var(--danger))] text-white hover:opacity-90 shadow-xs",
        outline: "border border-border bg-transparent text-foreground hover:bg-muted",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md",
        md: "h-9 px-4 text-[13px] rounded-md",
        lg: "h-10 px-5 text-sm rounded-md",
        icon: "h-9 w-9 p-0 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);

Button.displayName = "Button";

