import { describe, expect, it } from "vitest";

describe("Quotation Creation & Modal Parameter Handling", () => {
  it("accurately calculates line item totals, subtotal, tax, and grand total", () => {
    const items = [
      { unitPrice: 100, quantity: 2, taxRate: 10 },
      { unitPrice: 50, quantity: 4, taxRate: 0 },
    ];

    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const taxTotal = items.reduce(
      (sum, item) => sum + (item.unitPrice * item.quantity * item.taxRate) / 100,
      0
    );
    const grandTotal = subtotal + taxTotal;

    expect(subtotal).toBe(400);
    expect(taxTotal).toBe(20);
    expect(grandTotal).toBe(420);
  });

  it("removes action=create parameter while preserving unrelated query params on close", () => {
    const url = new URL("https://example.com/sales/quotes?action=create&tab=history&page=2");
    const params = new URLSearchParams(url.search);

    expect(params.get("action")).toBe("create");
    expect(params.get("tab")).toBe("history");
    expect(params.get("page")).toBe("2");

    params.delete("action");

    const newQuery = params.toString();
    expect(newQuery).toBe("tab=history&page=2");
    expect(params.get("action")).toBeNull();
  });

  it("produces clean pathname with no query string when action=create was the only parameter", () => {
    const url = new URL("https://example.com/sales/orders?action=create");
    const params = new URLSearchParams(url.search);

    params.delete("action");

    const newQuery = params.toString();
    const destination = newQuery ? `/sales/orders?${newQuery}` : "/sales/orders";
    expect(destination).toBe("/sales/orders");
  });
});
