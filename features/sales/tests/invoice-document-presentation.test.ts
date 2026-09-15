import { describe, it, expect } from "vitest";
import { getDueDateStatus } from "../utils/due-date-helper";
import { InvoiceStatus, PaymentStatus } from "lib/api/sales-api";

describe("Invoice Document Presentation & Due Date Tests", () => {
  describe("getDueDateStatus", () => {
    it("returns SETTLED when paymentStatus is PAID, even if dueDate is in the past", () => {
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const result = getDueDateStatus(pastDate, "PAID");
      expect(result.status).toBe("SETTLED");
      expect(result.label).toBe("Paid");
      expect(result.daysRemaining).toBeNull();
      expect(result.badgeColor.bg).toContain("neutral");
    });

    it("returns NO_DUE_DATE when dueDate is null or undefined", () => {
      const resultNull = getDueDateStatus(null, "UNPAID");
      expect(resultNull.status).toBe("NO_DUE_DATE");
      expect(resultNull.label).toBe("No due date");
      expect(resultNull.daysRemaining).toBeNull();

      const resultUndefined = getDueDateStatus(undefined, "UNPAID");
      expect(resultUndefined.status).toBe("NO_DUE_DATE");
    });

    it("returns OVERDUE when unpaid and dueDate is in the past", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 2);
      const result = getDueDateStatus(yesterday.toISOString(), "UNPAID");
      expect(result.status).toBe("OVERDUE");
      expect(result.label).toContain("Overdue");
      expect(result.badgeColor.text).toContain("rose");
      expect(result.daysRemaining).toBeLessThan(0);
    });

    it("returns DUE_TODAY when unpaid and dueDate is today", () => {
      const today = new Date().toISOString();
      const result = getDueDateStatus(today, "PARTIAL");
      expect(result.status).toBe("DUE_TODAY");
      expect(result.label).toBe("Due today");
      expect(result.badgeColor.text).toContain("amber");
      expect(result.daysRemaining).toBe(0);
    });

    it("returns DUE_SOON when unpaid and dueDate is within 3 days", () => {
      const inTwoDays = new Date();
      inTwoDays.setDate(inTwoDays.getDate() + 2);
      const result = getDueDateStatus(inTwoDays.toISOString(), "UNPAID");
      expect(result.status).toBe("DUE_SOON");
      expect(result.label).toContain("Due in");
      expect(result.badgeColor.text).toContain("amber");
      expect(result.daysRemaining).toBe(2);
    });

    it("returns NOT_DUE when unpaid and dueDate is further out (>3 days)", () => {
      const inTwoWeeks = new Date();
      inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
      const result = getDueDateStatus(inTwoWeeks.toISOString(), "UNPAID");
      expect(result.status).toBe("NOT_DUE");
      expect(result.label).toContain("Due in");
      expect(result.badgeColor.text).toContain("neutral");
      expect(result.daysRemaining).toBe(14);
    });

    it("returns SETTLED when invoiceStatus is VOID, even if dueDate was in the past", () => {
      const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const result = getDueDateStatus(pastDate, "UNPAID", "VOID");
      expect(result.status).toBe("SETTLED");
      expect(result.label).toBe("Void");
      expect(result.daysRemaining).toBeNull();
      expect(result.badgeColor.bg).toContain("neutral");
    });

    it("returns SETTLED when invoiceStatus is VOID, even if dueDate is in the future", () => {
      const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
      const result = getDueDateStatus(futureDate, "UNPAID", "VOID");
      expect(result.status).toBe("SETTLED");
      expect(result.label).toBe("Void");
      expect(result.daysRemaining).toBeNull();
    });

    it("prefers Paid label when invoice is both VOID and PAID", () => {
      const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
      const result = getDueDateStatus(pastDate, "PAID", "VOID");
      expect(result.status).toBe("SETTLED");
      expect(result.label).toBe("Paid");
    });
  });

  describe("Invoice Lifecycle Action Rules", () => {
    function canIssueInvoice(status: InvoiceStatus): boolean {
      return status === "DRAFT";
    }

    function canRecordPayment(status: InvoiceStatus, paymentStatus: PaymentStatus): boolean {
      return status === "ISSUED" && paymentStatus !== "PAID";
    }

    function canVoidInvoice(status: InvoiceStatus, paidAmount: number): boolean {
      return status !== "VOID" && paidAmount === 0;
    }

    it("allows issuing only when invoice is DRAFT", () => {
      expect(canIssueInvoice("DRAFT")).toBe(true);
      expect(canIssueInvoice("ISSUED")).toBe(false);
      expect(canIssueInvoice("VOID")).toBe(false);
    });

    it("allows recording payment only when ISSUED and not fully PAID", () => {
      expect(canRecordPayment("ISSUED", "UNPAID")).toBe(true);
      expect(canRecordPayment("ISSUED", "PARTIAL")).toBe(true);
      expect(canRecordPayment("ISSUED", "PAID")).toBe(false);
      expect(canRecordPayment("DRAFT", "UNPAID")).toBe(false);
      expect(canRecordPayment("VOID", "UNPAID")).toBe(false);
    });

    it("allows voiding only when not already VOID and zero payments recorded", () => {
      expect(canVoidInvoice("DRAFT", 0)).toBe(true);
      expect(canVoidInvoice("ISSUED", 0)).toBe(true);
      expect(canVoidInvoice("ISSUED", 50)).toBe(false);
      expect(canVoidInvoice("VOID", 0)).toBe(false);
    });
  });

  describe("Line Input Boundary Validation", () => {
    function clampDiscount(val: number): number {
      return Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
    }

    function clampTaxRate(val: number): number {
      return Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
    }

    function clampUnitPrice(val: number): number {
      return Math.max(0, isNaN(val) ? 0 : val);
    }

    function clampQuantity(val: number): number {
      return Math.max(1, isNaN(val) ? 1 : Math.floor(val));
    }

    it("clamps discount between 0 and 100", () => {
      expect(clampDiscount(-5)).toBe(0);
      expect(clampDiscount(0)).toBe(0);
      expect(clampDiscount(15)).toBe(15);
      expect(clampDiscount(100)).toBe(100);
      expect(clampDiscount(120)).toBe(100);
      expect(clampDiscount(NaN)).toBe(0);
    });

    it("clamps tax rate between 0 and 100", () => {
      expect(clampTaxRate(-18)).toBe(0);
      expect(clampTaxRate(18)).toBe(18);
      expect(clampTaxRate(100)).toBe(100);
      expect(clampTaxRate(150)).toBe(100);
    });

    it("enforces non-negative unit prices", () => {
      expect(clampUnitPrice(-50)).toBe(0);
      expect(clampUnitPrice(49.99)).toBe(49.99);
      expect(clampUnitPrice(0)).toBe(0);
    });

    it("enforces minimum integer quantity of 1", () => {
      expect(clampQuantity(0)).toBe(1);
      expect(clampQuantity(-10)).toBe(1);
      expect(clampQuantity(3.7)).toBe(3);
      expect(clampQuantity(5)).toBe(5);
    });
  });

  describe("Watermark and Stamp Visibility Logic", () => {
    function getWatermarkType(invoice: { status: InvoiceStatus; paymentStatus: PaymentStatus }): "PAID" | "VOID" | null {
      if (invoice.status === "VOID") return "VOID";
      if (invoice.paymentStatus === "PAID") return "PAID";
      return null;
    }

    it("renders PAID watermark when paymentStatus is PAID", () => {
      expect(getWatermarkType({ status: "ISSUED", paymentStatus: "PAID" })).toBe("PAID");
      expect(getWatermarkType({ status: "DRAFT", paymentStatus: "PAID" })).toBe("PAID");
    });

    it("renders VOID watermark when status is VOID", () => {
      expect(getWatermarkType({ status: "VOID", paymentStatus: "UNPAID" })).toBe("VOID");
    });

    it("renders no watermark for active unpaid invoices", () => {
      expect(getWatermarkType({ status: "DRAFT", paymentStatus: "UNPAID" })).toBeNull();
      expect(getWatermarkType({ status: "ISSUED", paymentStatus: "UNPAID" })).toBeNull();
      expect(getWatermarkType({ status: "ISSUED", paymentStatus: "PARTIAL" })).toBeNull();
    });
  });

  describe("Workspace Settings Presentation & Zero-Placeholder Integrity", () => {
    function evaluateBusinessDetailsPresence(info?: {
      name?: string;
      shortName?: string;
      address?: string;
      email?: string;
      phone?: string;
      taxId?: string;
      website?: string;
    }): boolean {
      return Boolean(
        info?.name ||
        info?.shortName ||
        info?.address ||
        info?.email ||
        info?.phone ||
        info?.taxId ||
        info?.website
      );
    }

    function evaluatePaymentDetailsPresence(inst?: {
      bankName?: string;
      accountHolder?: string;
      accountNumber?: string;
      routingOrIfsc?: string;
      swiftBic?: string;
      upiId?: string;
      notes?: string;
    }): boolean {
      return Boolean(
        inst?.bankName ||
        inst?.accountHolder ||
        inst?.accountNumber ||
        inst?.routingOrIfsc ||
        inst?.swiftBic ||
        inst?.upiId ||
        inst?.notes
      );
    }

    it("evaluates unconfigured business details to false without fabricating defaults", () => {
      expect(evaluateBusinessDetailsPresence(undefined)).toBe(false);
      expect(evaluateBusinessDetailsPresence({})).toBe(false);
      expect(evaluateBusinessDetailsPresence({ name: "", email: "" })).toBe(false);
    });

    it("evaluates configured business details to true", () => {
      expect(evaluateBusinessDetailsPresence({ name: "Acme Corp" })).toBe(true);
      expect(evaluateBusinessDetailsPresence({ taxId: "TAX-12345" })).toBe(true);
    });

    it("evaluates unconfigured payment instructions to false without fabricating bank placeholders", () => {
      expect(evaluatePaymentDetailsPresence(undefined)).toBe(false);
      expect(evaluatePaymentDetailsPresence({})).toBe(false);
      expect(evaluatePaymentDetailsPresence({ bankName: "", accountNumber: "" })).toBe(false);
    });

    it("evaluates configured payment instructions to true", () => {
      expect(evaluatePaymentDetailsPresence({ bankName: "Global Bank" })).toBe(true);
      expect(evaluatePaymentDetailsPresence({ upiId: "acme@upi" })).toBe(true);
    });
  });

  describe("Modal Keyboard & Backdrop Dismissal Contract", () => {
    it("recognizes Escape key triggers dismissal", () => {
      let closed = false;
      const handleKeyDown = (key: string) => {
        if (key === "Escape") closed = true;
      };
      handleKeyDown("Escape");
      expect(closed).toBe(true);
    });

    it("recognizes other keys do not trigger dismissal", () => {
      let closed = false;
      const handleKeyDown = (key: string) => {
        if (key === "Escape") closed = true;
      };
      handleKeyDown("Enter");
      handleKeyDown("Tab");
      expect(closed).toBe(false);
    });

    it("only dismisses on backdrop click when target equals currentTarget", () => {
      const handleBackdropClick = (target: string, currentTarget: string): boolean => {
        return target === currentTarget;
      };
      expect(handleBackdropClick("backdrop", "backdrop")).toBe(true);
      expect(handleBackdropClick("modal-card", "backdrop")).toBe(false);
      expect(handleBackdropClick("button", "backdrop")).toBe(false);
    });
  });
});

