import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "./api-client";
import { adjustStock, transferStock } from "./inventory-api";

describe("Inventory API Client-Side Automatic Idempotency", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("adjustStock: automatically attaches op_ UUID operationId when not provided", async () => {
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          level: { _id: "lvl-1", onHand: 10 },
          movement: { _id: "mov-1", operationId: "op-mock" },
        },
      },
    } as any);

    await adjustStock({
      locationId: "loc-123",
      inventoryItemId: "itm-456",
      type: "RECEIPT",
      quantity: 15,
    });

    expect(postSpy).toHaveBeenCalledTimes(1);
    const [url, payload] = postSpy.mock.calls[0] as [string, any];
    expect(url).toBe("/api/inventory/adjust");
    expect(payload.operationId).toBeDefined();
    expect(payload.operationId).toMatch(/^op_[a-zA-Z0-9_-]+/);
    expect(payload.quantity).toBe(15);
  });

  it("adjustStock: preserves explicitly supplied operationId without overwriting", async () => {
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          level: { _id: "lvl-1", onHand: 20 },
          movement: { _id: "mov-2", operationId: "custom-op-id-789" },
        },
      },
    } as any);

    const customOpId = "custom-op-id-789";
    await adjustStock({
      locationId: "loc-123",
      inventoryItemId: "itm-456",
      type: "RECEIPT",
      quantity: 10,
      operationId: customOpId,
    });

    expect(postSpy).toHaveBeenCalledTimes(1);
    const [, payload] = postSpy.mock.calls[0] as [string, any];
    expect(payload.operationId).toBe(customOpId);
  });

  it("transferStock: automatically attaches op_ UUID operationId when not provided", async () => {
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          sourceLevel: { _id: "lvl-src", onHand: 5 },
          destinationLevel: { _id: "lvl-dst", onHand: 10 },
          movement: { _id: "mov-xfer", operationId: "op-mock" },
        },
      },
    } as any);

    await transferStock({
      inventoryItemId: "itm-456",
      sourceLocationId: "loc-src",
      destinationLocationId: "loc-dst",
      quantity: 5,
    });

    expect(postSpy).toHaveBeenCalledTimes(1);
    const [url, payload] = postSpy.mock.calls[0] as [string, any];
    expect(url).toBe("/api/inventory/transfer");
    expect(payload.operationId).toBeDefined();
    expect(payload.operationId).toMatch(/^op_[a-zA-Z0-9_-]+/);
    expect(payload.quantity).toBe(5);
  });

  it("transferStock: preserves explicitly supplied operationId without overwriting", async () => {
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          sourceLevel: { _id: "lvl-src", onHand: 5 },
          destinationLevel: { _id: "lvl-dst", onHand: 10 },
          movement: { _id: "mov-xfer", operationId: "custom-xfer-op-555" },
        },
      },
    } as any);

    const customOpId = "custom-xfer-op-555";
    await transferStock({
      inventoryItemId: "itm-456",
      sourceLocationId: "loc-src",
      destinationLocationId: "loc-dst",
      quantity: 5,
      operationId: customOpId,
    });

    expect(postSpy).toHaveBeenCalledTimes(1);
    const [, payload] = postSpy.mock.calls[0] as [string, any];
    expect(payload.operationId).toBe(customOpId);
  });
});
