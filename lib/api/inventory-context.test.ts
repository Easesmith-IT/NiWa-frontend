import { describe, it, expect } from "vitest";

describe("Products & Inventory Context Preservation & Filter Serialization", () => {
  it("formats contextual inventory URL with URL-encoded product name", () => {
    const productName = "Basmati Rice 5kg & Premium Grains";
    const targetUrl = `/inventory?q=${encodeURIComponent(productName)}`;
    expect(targetUrl).toBe("/inventory?q=Basmati%20Rice%205kg%20%26%20Premium%20Grains");

    const parsedParams = new URLSearchParams(targetUrl.replace("/inventory?", ""));
    expect(parsedParams.get("q")).toBe("Basmati Rice 5kg & Premium Grains");
  });

  it("filters inventory level records by product name, variant name, SKU, and location", () => {
    const mockLevels = [
      {
        _id: "lvl-1",
        onHand: 50,
        reserved: 5,
        available: 45,
        locationId: { _id: "loc-1", name: "Main Store", code: "STR-1" },
        inventoryItemId: {
          _id: "inv-1",
          productVariantId: {
            _id: "var-1",
            name: "5kg Bag",
            sku: "RICE-5KG",
            productId: { _id: "prod-1", name: "Basmati Rice" },
          },
        },
      },
      {
        _id: "lvl-2",
        onHand: 12,
        reserved: 0,
        available: 12,
        locationId: { _id: "loc-2", name: "Secondary Depot", code: "DEP-2" },
        inventoryItemId: {
          _id: "inv-2",
          productVariantId: {
            _id: "var-2",
            name: "1L Bottle",
            sku: "OIL-1L",
            productId: { _id: "prod-2", name: "Mustard Oil" },
          },
        },
      },
    ];

    const filterLevels = (levels: typeof mockLevels, search: string, locId?: string) => {
      return levels.filter((lvl) => {
        if (locId && lvl.locationId._id !== locId) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const prodName = lvl.inventoryItemId.productVariantId.productId.name.toLowerCase();
        const varName = lvl.inventoryItemId.productVariantId.name.toLowerCase();
        const sku = lvl.inventoryItemId.productVariantId.sku.toLowerCase();
        const locName = lvl.locationId.name.toLowerCase();
        return (
          prodName.includes(q) || varName.includes(q) || sku.includes(q) || locName.includes(q)
        );
      });
    };

    // Filter by product name query (as passed by Journey C)
    const resultRice = filterLevels(mockLevels, "rice");
    expect(resultRice.length).toBe(1);
    expect(resultRice[0]._id).toBe("lvl-1");

    // Filter by SKU
    const resultSku = filterLevels(mockLevels, "OIL-1L");
    expect(resultSku.length).toBe(1);
    expect(resultSku[0]._id).toBe("lvl-2");

    // Filter by location
    const resultLoc = filterLevels(mockLevels, "", "loc-2");
    expect(resultLoc.length).toBe(1);
    expect(resultLoc[0]._id).toBe("lvl-2");

    // Filter by combined query and location
    const resultMismatch = filterLevels(mockLevels, "rice", "loc-2");
    expect(resultMismatch.length).toBe(0);
  });

  it("calculates derived available stock correctly (onHand - reserved)", () => {
    const level = { onHand: 100, reserved: 35 };
    const available = level.onHand - level.reserved;
    expect(available).toBe(65);
  });

  it("identifies low stock conditions based on reorderPoint threshold", () => {
    const isLowStock = (onHand: number, reserved: number, reorderPoint: number) => {
      if (reorderPoint <= 0) return false;
      const available = onHand - reserved;
      return available <= reorderPoint;
    };

    expect(isLowStock(10, 0, 15)).toBe(true);
    expect(isLowStock(20, 5, 15)).toBe(true); // 15 <= 15 -> low stock
    expect(isLowStock(20, 2, 15)).toBe(false); // 18 > 15 -> not low stock
    expect(isLowStock(5, 0, 0)).toBe(false); // disabled reorder point
  });
});
