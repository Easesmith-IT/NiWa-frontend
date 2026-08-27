import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearActiveWorkspaceId,
  getActiveWorkspaceId,
  isValidWorkspaceId,
  setActiveWorkspaceId,
} from "./workspace-state";

class LocalStorageMock implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] ?? null;
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

describe("Workspace State & Isolation", () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    const localStorage = new LocalStorageMock();
    const eventTarget = new EventTarget();

    globalThis.window = {
      localStorage,
      dispatchEvent: (event: Event) => eventTarget.dispatchEvent(event),
      addEventListener: eventTarget.addEventListener.bind(eventTarget),
      removeEventListener: eventTarget.removeEventListener.bind(eventTarget),
    } as unknown as Window & typeof globalThis;
  });

  afterEach(() => {
    globalThis.window = originalWindow;
  });

  it("1. isValidWorkspaceId correctly identifies real vs legacy default workspace IDs", () => {
    expect(isValidWorkspaceId("ws_12345")).toBe(true);
    expect(isValidWorkspaceId("workspace-alpha")).toBe(true);

    expect(isValidWorkspaceId("ws-default")).toBe(false);
    expect(isValidWorkspaceId("ws_default")).toBe(false);
    expect(isValidWorkspaceId("default")).toBe(false);
    expect(isValidWorkspaceId("")).toBe(false);
    expect(isValidWorkspaceId("   ")).toBe(false);
    expect(isValidWorkspaceId(null)).toBe(false);
    expect(isValidWorkspaceId(undefined)).toBe(false);
  });

  it("2. getActiveWorkspaceId returns null and purges legacy defaults", () => {
    window.localStorage.setItem("activeWorkspaceId", "ws-default");
    expect(getActiveWorkspaceId()).toBeNull();
    expect(window.localStorage.getItem("activeWorkspaceId")).toBeNull();

    window.localStorage.setItem("activeWorkspaceId", "ws_default");
    expect(getActiveWorkspaceId()).toBeNull();
    expect(window.localStorage.getItem("activeWorkspaceId")).toBeNull();
  });

  it("3. setActiveWorkspaceId stores valid workspace and clears invalid ones", () => {
    setActiveWorkspaceId("ws_tenant_99");
    expect(getActiveWorkspaceId()).toBe("ws_tenant_99");
    expect(window.localStorage.getItem("activeWorkspaceId")).toBe("ws_tenant_99");

    setActiveWorkspaceId("ws-default");
    expect(getActiveWorkspaceId()).toBeNull();
    expect(window.localStorage.getItem("activeWorkspaceId")).toBeNull();
  });

  it("4. clearActiveWorkspaceId completely removes workspace state", () => {
    setActiveWorkspaceId("ws_tenant_99");
    expect(getActiveWorkspaceId()).toBe("ws_tenant_99");

    clearActiveWorkspaceId();
    expect(getActiveWorkspaceId()).toBeNull();
    expect(window.localStorage.getItem("activeWorkspaceId")).toBeNull();
  });

  it("5. Workspace switching dispatches event to notify consumers", () => {
    const listener = vi.fn();
    window.addEventListener("niwa:workspace-changed", listener);

    setActiveWorkspaceId("ws_tenant_A");
    expect(listener).toHaveBeenCalledTimes(1);

    setActiveWorkspaceId("ws_tenant_B");
    expect(listener).toHaveBeenCalledTimes(2);

    clearActiveWorkspaceId();
    expect(listener).toHaveBeenCalledTimes(3);
  });
});
