import { afterEach, vi } from "vitest";
import React from "react";

// Provide global React for SSR/static testing in Node environment
(globalThis as any).React = React;

// Unit/integration tests must never open the production realtime transport.
process.env.NEXT_PUBLIC_REALTIME_TRANSPORT = "none";

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
