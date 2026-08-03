"use client";

export function ThreadListSkeleton() {
  return (
    <div className="divide-y divide-[#ece1d4] animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div className="flex w-full items-start gap-3 px-6 py-4" key={i}>
          <div className="h-12 w-12 shrink-0 rounded-full bg-[#e8ded0]" />
          <div className="min-w-0 flex-1 space-y-2 py-0.5">
            <div className="flex items-center justify-between gap-3">
              <div className="h-4 w-32 rounded bg-[#e8ded0]" />
              <div className="h-3 w-12 rounded bg-[#e8ded0]" />
            </div>
            <div className="h-3.5 w-48 rounded bg-[#eee4d8]" />
          </div>
        </div>
      ))}
    </div>
  );
}
