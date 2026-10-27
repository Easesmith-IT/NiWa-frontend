import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  PRICING_CATEGORIES,
  isPriceCardConfigured,
  resolveCategoryPricingView,
  resolveEditorInitialPrice,
} from "./customer-pricing.utils";
import { CustomerPricingCard } from "./components/CustomerPricingCard";
import type { WhatsAppCustomerRateCard } from "./whatsapp-billing.types";

describe("NIWA WhatsApp Customer Pricing Frontend Architecture", () => {
  const marketingMeta = PRICING_CATEGORIES.find((c) => c.key === "marketing")!;
  const utilityMeta = PRICING_CATEGORIES.find((c) => c.key === "utility")!;
  const authMeta = PRICING_CATEGORIES.find((c) => c.key === "authentication")!;
  const serviceMeta = PRICING_CATEGORIES.find((c) => c.key === "service")!;

  describe("1. isPriceCardConfigured", () => {
    it("returns false for undefined or null card", () => {
      expect(isPriceCardConfigured(undefined)).toBe(false);
      expect(isPriceCardConfigured(null as any)).toBe(false);
    });

    it("returns false for cards with missing, non-numeric, 0, or negative pricePaise", () => {
      expect(isPriceCardConfigured({ pricePaise: 0 } as any)).toBe(false);
      expect(isPriceCardConfigured({ pricePaise: -10 } as any)).toBe(false);
      expect(isPriceCardConfigured({ pricePaise: NaN } as any)).toBe(false);
      expect(isPriceCardConfigured({ pricePaise: undefined } as any)).toBe(false);
      expect(isPriceCardConfigured({} as any)).toBe(false);
    });

    it("returns true for cards with valid positive pricePaise", () => {
      expect(isPriceCardConfigured({ pricePaise: 88 } as any)).toBe(true);
      expect(isPriceCardConfigured({ pricePaise: 15 } as any)).toBe(true);
      expect(isPriceCardConfigured({ pricePaise: 120 } as any)).toBe(true);
    });
  });

  describe("2. resolveCategoryPricingView - Unconfigured vs Approved Active Distinction", () => {
    it("when no card exists, displays unresolved/unconfigured state and refuses illustrative default as active price", () => {
      const view = resolveCategoryPricingView(undefined, marketingMeta);

      expect(view.isConfigured).toBe(false);
      expect(view.status).toBe("UNRESOLVED_UNCONFIGURED");
      expect(view.statusBadgeText).toBe("Unconfigured");
      expect(view.statusBadgeVariant).toBe("warning");

      // Critical requirement: MUST NOT present illustrative default as if it were configured pricing
      expect(view.priceDisplayInr).toBe("Not Configured");
      expect(view.priceDisplayInr).not.toBe("₹0.88");
      expect(view.priceDisplayInr).not.toBe("0.88");
      expect(view.pricePaiseValue).toBeUndefined();
      expect(view.pricePaiseBadgeText).toBe("No Rate Set");

      // Fails closed notification
      expect(view.billingRuleNote).toContain("BILLING_PRICE_UNRESOLVED");
      expect(view.billingRuleNote).toContain("fail closed");

      // Illustrative benchmark is strictly distinguished and labeled
      expect(view.illustrativeBenchmarkInr).toBe("0.88");
      expect(view.illustrativeBenchmarkPaise).toBe(88);
      expect(view.buttonText).toBe("Configure Approved Price");
    });

    it("all 4 standard categories fail closed with 'Not Configured' when rate cards array is empty", () => {
      const metas = [marketingMeta, utilityMeta, authMeta, serviceMeta];

      for (const meta of metas) {
        const view = resolveCategoryPricingView(undefined, meta);
        expect(view.isConfigured).toBe(false);
        expect(view.priceDisplayInr).toBe("Not Configured");
        expect(view.pricePaiseValue).toBeUndefined();
        expect(view.pricePaiseBadgeText).toBe("No Rate Set");
      }
    });

    it("when approved card exists, displays exact active commercial rate and approved badge", () => {
      const activeMarketingCard: WhatsAppCustomerRateCard = {
        _id: "card_mkt_1",
        workspaceId: "default",
        category: "marketing",
        countryCode: "IN",
        pricePaise: 95,
        priceInr: "0.95",
        currency: "INR",
        taxPercent: 18,
        taxMode: "exclusive",
        effectiveFrom: "2026-10-01T00:00:00Z",
        effectiveTo: null,
        isCustom: false,
        notes: "Approved under Q4 commercial plan",
      };

      const view = resolveCategoryPricingView(activeMarketingCard, marketingMeta);

      expect(view.isConfigured).toBe(true);
      expect(view.status).toBe("ACTIVE_CONFIGURED");
      expect(view.statusBadgeText).toBe("Approved & Active");
      expect(view.statusBadgeVariant).toBe("success");
      expect(view.priceDisplayInr).toBe("₹0.95");
      expect(view.pricePaiseValue).toBe(95);
      expect(view.pricePaiseBadgeText).toBe("95 paise");
      expect(view.billingRuleNote).toBe("per delivered message + 18% GST (exclusive)");
      expect(view.notes).toBe("Approved under Q4 commercial plan");
      expect(view.buttonText).toBe("Update Price");
    });
  });

  describe("3. resolveEditorInitialPrice - Modal Input Prepopulation Guard", () => {
    it("returns empty string (\"\") when no existing price exists (never prepopulates 88 paise)", () => {
      const initialUnconfigured = resolveEditorInitialPrice(undefined);
      expect(initialUnconfigured).toBe("");
      expect(initialUnconfigured).not.toBe(88);
      expect(initialUnconfigured).not.toBe(15);
      expect(initialUnconfigured).not.toBe(35);
    });

    it("returns empty string (\"\") if currentPricePaise is 0 or negative", () => {
      expect(resolveEditorInitialPrice(0)).toBe("");
      expect(resolveEditorInitialPrice(-50)).toBe("");
    });

    it("returns the exact existing price when opening editor for an active configured rate card", () => {
      expect(resolveEditorInitialPrice(120)).toBe(120);
      expect(resolveEditorInitialPrice(88)).toBe(88);
    });
  });

  describe("4. CustomerPricingCard Component Static Presentation", () => {
    const renderCard = (rateCards: WhatsAppCustomerRateCard[]) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      return renderToStaticMarkup(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CustomerPricingCard, { rateCards, isLoading: false, isAdmin: true })
        )
      );
    };

    it("renders unconfigured state and warning banner when no rate cards exist", () => {
      const html = renderCard([]);

      // Must display unconfigured status
      expect(html).toContain("4 of 4 categories unconfigured");
      expect(html).toContain("BILLING_PRICE_UNRESOLVED");
      expect(html).toContain("Not Configured");
      expect(html).toContain("Requires commercial rate approval");
      expect(html).toContain("Illustrative benchmark:");
      expect(html).toContain("not active");

      // Verify that active price is NOT presented as ₹0.88 or ₹0.15 in the big price header
      expect(html).not.toContain("text-3xl font-extrabold");
    });

    it("renders active approved cards alongside unconfigured cards without cross-contamination", () => {
      const partialCards: WhatsAppCustomerRateCard[] = [
        {
          _id: "card_util_1",
          workspaceId: "default",
          category: "utility",
          countryCode: "IN",
          pricePaise: 20,
          priceInr: "0.20",
          currency: "INR",
          taxPercent: 18,
          taxMode: "exclusive",
          effectiveFrom: "2026-10-01T00:00:00Z",
          effectiveTo: null,
          isCustom: false,
        },
      ];

      const html = renderCard(partialCards);

      // 3 of 4 categories remain unconfigured
      expect(html).toContain("3 of 4 categories unconfigured");

      // Utility shows configured ₹0.20 and 20 paise
      expect(html).toContain("₹0.20");
      expect(html).toContain("20 paise");

      // Marketing, Authentication, Service show Not Configured
      expect(html).toContain("Not Configured");
      expect(html).toContain("Configure Approved Price");
      expect(html).toContain("Update Price");
    });
  });
});
