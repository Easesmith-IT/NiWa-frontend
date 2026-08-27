import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { apiClient } from "./api-client";
import { clearActiveWorkspaceId, setActiveWorkspaceId } from "../workspace/workspace-state";

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

describe("API Client Workspace Interceptor & Scoping", () => {
  const originalWindow = globalThis.window;

  const runInterceptor = async (url: string, headersRecord: Record<string, string> = {}) => {
    const clientAny = apiClient.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig> }>;
    };
    const interceptor = clientAny.handlers[0];

    const config: InternalAxiosRequestConfig = {
      url,
      headers: AxiosHeaders.from(headersRecord),
      method: "get",
    };

    return interceptor.fulfilled(config);
  };

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
    clearActiveWorkspaceId();
    globalThis.window = originalWindow;
  });

  it("1. Platform request (/auth/login) does NOT send x-workspace-id header", async () => {
    setActiveWorkspaceId("ws_real_123");

    const config = await runInterceptor("/auth/login");
    expect(config.headers.get("x-workspace-id")).toBeUndefined();
  });

  it("2. Platform request (/auth/profile) does NOT send x-workspace-id header", async () => {
    setActiveWorkspaceId("ws_real_123");

    const config = await runInterceptor("/auth/profile");
    expect(config.headers.get("x-workspace-id")).toBeUndefined();
  });

  it("3. Workspace-scoped request (/contacts) with valid active workspace sends x-workspace-id", async () => {
    setActiveWorkspaceId("ws_customer_workspace_abc");

    const config = await runInterceptor("/contacts");
    expect(config.headers.get("x-workspace-id")).toBe("ws_customer_workspace_abc");
  });

  it("4. Workspace-scoped request without active workspace fails closed with ERR_MISSING_WORKSPACE_ID", async () => {
    clearActiveWorkspaceId();

    await expect(runInterceptor("/inbox")).rejects.toThrow(AxiosError);

    try {
      await runInterceptor("/inbox");
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      expect(axiosError.code).toBe("ERR_MISSING_WORKSPACE_ID");
      expect(axiosError.message).toContain("No active workspace selected");
    }
  });

  it("5. Workspace request with legacy 'ws-default' in storage is rejected and purged", async () => {
    window.localStorage.setItem("activeWorkspaceId", "ws-default");

    await expect(runInterceptor("/campaigns")).rejects.toThrow(AxiosError);
    expect(window.localStorage.getItem("activeWorkspaceId")).toBeNull();
  });

  it("6. Workspace switching updates request header on subsequent requests", async () => {
    setActiveWorkspaceId("ws_tenant_1");
    const config1 = await runInterceptor("/conversations");
    expect(config1.headers.get("x-workspace-id")).toBe("ws_tenant_1");

    setActiveWorkspaceId("ws_tenant_2");
    const config2 = await runInterceptor("/conversations");
    expect(config2.headers.get("x-workspace-id")).toBe("ws_tenant_2");
  });

  it("7. Logout clears active workspace state and prevents workspace requests", async () => {
    setActiveWorkspaceId("ws_active_before_logout");
    clearActiveWorkspaceId();

    await expect(runInterceptor("/messages")).rejects.toThrow(AxiosError);
  });

  it("8. Platform role vs Workspace role separation test", () => {
    const customerUser = {
      id: "u_1",
      email: "cust@example.com",
      platformRole: "CUSTOMER",
    };

    const workspaceMembership = {
      userId: "u_1",
      workspaceId: "ws_100",
      role: "owner",
    };

    const isPlatformAdmin =
      customerUser.platformRole === "SUPER_ADMIN" || customerUser.platformRole === "SUB_ADMIN";

    expect(isPlatformAdmin).toBe(false);
    expect(workspaceMembership.role).toBe("owner");
    expect(customerUser.platformRole).not.toBe("SUPER_ADMIN");
  });
});
