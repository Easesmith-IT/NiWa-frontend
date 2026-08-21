import { ReactNode } from "react";
import { cn } from "../../../lib/utils";

export interface InboxLayoutProps {
  threadList: ReactNode;
  children: ReactNode;
  hasDetail: boolean;
  isContactInfoOpen: boolean;
}

export function InboxLayout({
  threadList,
  children,
  hasDetail,
  isContactInfoOpen,
}: InboxLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background text-foreground">
      <div
        className={cn(
          "grid h-full min-h-0 flex-1",
          hasDetail
            ? isContactInfoOpen
              ? "xl:grid-cols-[340px_minmax(0,1fr)_360px]"
              : "xl:grid-cols-[340px_minmax(0,1fr)]"
            : "xl:grid-cols-[340px_minmax(0,1fr)]",
        )}
      >
        {threadList}
        {children}
      </div>
    </div>
  );
}
