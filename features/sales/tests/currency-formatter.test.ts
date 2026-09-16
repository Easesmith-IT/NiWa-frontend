import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  getCurrencySymbol,
  COMMON_CURRENCIES,
} from "../utils/currency-formatter";

describe("Sales Currency Formatter Tests", () => {
  describe("formatCurrency", () => {
    it("formats USD correctly with 2 decimals", () => {
      const formatted = formatCurrency(1234.56, "USD", "en-US");
      expect(formatted).toContain("1,234.56");
      expect(formatted).toContain("$");
    });

    it("formats EUR correctly with locale support", () => {
      const formatted = formatCurrency(1234.56, "EUR", "en-US");
      expect(formatted).toContain("1,234.56");
      expect(formatted).toContain("€");
    });

    it("formats GBP correctly", () => {
      const formatted = formatCurrency(99.9, "GBP", "en-US");
      expect(formatted).toContain("99.90");
      expect(formatted).toContain("£");
    });

    it("formats INR correctly", () => {
      const formatted = formatCurrency(50000, "INR", "en-IN");
      expect(formatted).toMatch(/₹|INR/);
      expect(formatted).toContain("50,000.00");
    });

    it("formats JPY (0 fraction digits) correctly", () => {
      const formatted = formatCurrency(1500, "JPY", "en-US");
      expect(formatted).toContain("1,500");
      expect(formatted).toContain("¥");
    });

    it("formats AED correctly", () => {
      const formatted = formatCurrency(250.75, "AED", "en-US");
      expect(formatted).toContain("250.75");
      expect(formatted).toMatch(/AED/);
    });

    it("falls back to USD when currency is omitted or undefined", () => {
      const formatted = formatCurrency(100);
      expect(formatted).toContain("100.00");
      expect(formatted).toContain("$");
    });

    it("handles zero amounts gracefully", () => {
      const formatted = formatCurrency(0, "USD", "en-US");
      expect(formatted).toBe("$0.00");
    });

    it("handles negative amounts gracefully", () => {
      const formatted = formatCurrency(-45.5, "USD", "en-US");
      expect(formatted).toContain("45.50");
      expect(formatted).toContain("-");
    });

    it("handles invalid or non-numeric amounts safely without throwing", () => {
      const formatted = formatCurrency(NaN as any, "USD", "en-US");
      expect(formatted).toBe("$0.00");
    });

    it("falls back gracefully if an invalid ISO currency code is provided", () => {
      const formatted = formatCurrency(100, "INVALID_CODE", "en-US");
      expect(formatted).toContain("100.00");
    });
  });

  describe("getCurrencySymbol", () => {
    it("returns correct symbols for common currencies", () => {
      expect(getCurrencySymbol("USD")).toBe("$");
      expect(getCurrencySymbol("EUR")).toBe("€");
      expect(getCurrencySymbol("GBP")).toBe("£");
      expect(getCurrencySymbol("INR")).toBe("₹");
      expect(getCurrencySymbol("JPY")).toMatch(/¥/);
    });

    it("falls back gracefully for unknown currency codes", () => {
      const sym = getCurrencySymbol("XYZ");
      expect(typeof sym).toBe("string");
    });
  });

  describe("COMMON_CURRENCIES", () => {
    it("includes major global trading currencies", () => {
      const codes = COMMON_CURRENCIES.map((c) => c.code);
      expect(codes).toContain("USD");
      expect(codes).toContain("EUR");
      expect(codes).toContain("GBP");
      expect(codes).toContain("INR");
      expect(codes).toContain("CAD");
      expect(codes).toContain("AUD");
      expect(codes).toContain("JPY");
      expect(codes).toContain("AED");
    });

    it("each common currency has code, symbol, and label", () => {
      COMMON_CURRENCIES.forEach((c) => {
        expect(c.code).toMatch(/^[A-Z]{3}$/);
        expect(c.symbol.length).toBeGreaterThan(0);
        expect(c.label.length).toBeGreaterThan(0);
      });
    });
  });
});
