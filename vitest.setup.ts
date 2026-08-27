import { afterEach, vi } from "vitest";

// Unit/integration tests must never open the production realtime transport.
process.env.NEXT_PUBLIC_REALTIME_TRANSPORT = "none";

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
