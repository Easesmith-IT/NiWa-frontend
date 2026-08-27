"use client";

export function ChatWindowSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#fbf7f1] animate-pulse">
      {/* Header Skeleton */}
      <div className="flex h-[72px] items-center justify-between border-b border-[#ddd2c3] bg-[#fbf7f1] px-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#e8ded0]" />
          <div className="space-y-1.5">
            <div className="h-4 w-36 rounded bg-[#e8ded0]" />
            <div className="h-3 w-24 rounded bg-[#eee4d8]" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 rounded-full bg-[#e8ded0]" />
          <div className="h-8 w-8 rounded-full bg-[#e8ded0]" />
        </div>
      </div>

      {/* Message Stream Skeleton */}
      <div className="flex-1 space-y-4 p-6 overflow-y-auto">
        {/* Date Pill Skeleton */}
        <div className="mx-auto h-6 w-28 rounded-full bg-[#e8ded0]" />

        {/* Incoming Bubble */}
        <div className="flex justify-start">
          <div className="max-w-[65%] rounded-2xl rounded-bl-md bg-white p-4 space-y-2 shadow-sm border border-[#ece1d4]">
            <div className="h-4 w-52 rounded bg-[#eee4d8]" />
            <div className="h-4 w-36 rounded bg-[#eee4d8]" />
            <div className="h-3 w-12 rounded bg-[#f2ebe2] ml-auto" />
          </div>
        </div>

        {/* Outgoing Bubble */}
        <div className="flex justify-end">
          <div className="max-w-[65%] rounded-2xl rounded-br-md bg-[#dfeee3] p-4 space-y-2 shadow-sm border border-[#cde0d2]">
            <div className="h-4 w-64 rounded bg-[#c5ddcc]" />
            <div className="h-4 w-40 rounded bg-[#c5ddcc]" />
            <div className="h-3 w-12 rounded bg-[#b8d6bf] ml-auto" />
          </div>
        </div>

        {/* Incoming Bubble */}
        <div className="flex justify-start">
          <div className="max-w-[65%] rounded-2xl rounded-bl-md bg-white p-4 space-y-2 shadow-sm border border-[#ece1d4]">
            <div className="h-4 w-44 rounded bg-[#eee4d8]" />
            <div className="h-3 w-12 rounded bg-[#f2ebe2] ml-auto" />
          </div>
        </div>

        {/* Outgoing Bubble */}
        <div className="flex justify-end">
          <div className="max-w-[65%] rounded-2xl rounded-br-md bg-[#dfeee3] p-4 space-y-2 shadow-sm border border-[#cde0d2]">
            <div className="h-4 w-48 rounded bg-[#c5ddcc]" />
            <div className="h-3 w-12 rounded bg-[#b8d6bf] ml-auto" />
          </div>
        </div>
      </div>

      {/* Composer Skeleton */}
      <div className="border-t border-[#ddd2c3] bg-[#fbf7f1] p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#e8ded0]" />
          <div className="h-12 flex-1 rounded-[28px] bg-white border border-[#ddd2c3]" />
          <div className="h-10 w-10 rounded-full bg-[#2d644d] opacity-50" />
        </div>
      </div>
    </div>
  );
}
