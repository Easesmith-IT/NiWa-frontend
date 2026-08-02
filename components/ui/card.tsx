import { HTMLAttributes } from "react";

import { cn } from "../../lib/utils";

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-xl border border-border/80 bg-card text-card-foreground shadow-[0_8px_24px_rgba(28,34,31,0.04)]",
      className,
    )}
    {...props}
  />
);
