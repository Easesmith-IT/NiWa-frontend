import type { WhatsAppCustomerRateCard } from "./whatsapp-billing.types";

export type WhatsAppBillingCategory = "marketing" | "utility" | "authentication" | "service";

export interface CategoryPricingMeta {
  key: WhatsAppBillingCategory;
  label: string;
  desc: string;
  illustrativeBenchmarkPaise: number;
  illustrativeBenchmarkInr: string;
}

export const PRICING_CATEGORIES: CategoryPricingMeta[] = [
  {
    key: "marketing",
    label: "Marketing",
    desc: "Promotions, offers, announcements, and product updates",
    illustrativeBenchmarkPaise: 88,
    illustrativeBenchmarkInr: "0.88",
  },
  {
    key: "utility",
    label: "Utility",
    desc: "Order alerts, shipping updates, account receipts, payment reminders",
    illustrativeBenchmarkPaise: 15,
    illustrativeBenchmarkInr: "0.15",
  },
  {
    key: "authentication",
    label: "Authentication / OTP",
    desc: "One-time passwords, login codes, account verification",
    illustrativeBenchmarkPaise: 15,
    illustrativeBenchmarkInr: "0.15",
  },
  {
    key: "service",
    label: "Service / Support",
    desc: "Customer care responses initiated within 24hr service window",
    illustrativeBenchmarkPaise: 35,
    illustrativeBenchmarkInr: "0.35",
  },
];

export interface CategoryPricingViewModel {
  category: WhatsAppBillingCategory;
  label: string;
  desc: string;
  isConfigured: boolean;
  status: "ACTIVE_CONFIGURED" | "UNRESOLVED_UNCONFIGURED";
  statusBadgeText: string;
  statusBadgeVariant: "success" | "warning";
  priceDisplayInr: string;
  pricePaiseValue?: number;
  pricePaiseBadgeText: string;
  billingRuleNote: string;
  illustrativeBenchmarkInr: string;
  illustrativeBenchmarkPaise: number;
  taxPercent: number;
  taxMode: "exclusive" | "inclusive";
  notes?: string;
  effectiveFrom?: string;
  buttonText: string;
}

/**
 * Checks whether a customer rate card has an active, commercially valid price.
 */
export function isPriceCardConfigured(card?: WhatsAppCustomerRateCard): boolean {
  if (!card) return false;
  if (typeof card.pricePaise !== "number") return false;
  if (!Number.isFinite(card.pricePaise)) return false;
  return card.pricePaise > 0;
}

/**
 * Resolves the presentation view model for a customer pricing category.
 * When no approved rate card exists, it returns an explicit UNRESOLVED/UNCONFIGURED state
 * and strictly refuses to substitute hardcoded illustrative prices for active commercial rates.
 */
export function resolveCategoryPricingView(
  card: WhatsAppCustomerRateCard | undefined,
  meta: CategoryPricingMeta
): CategoryPricingViewModel {
  const isConfigured = isPriceCardConfigured(card);

  if (isConfigured && card) {
    const formattedInr = (card.pricePaise / 100).toFixed(2);
    const taxPercent = typeof card.taxPercent === "number" ? card.taxPercent : 18;
    const taxMode = card.taxMode || "exclusive";

    return {
      category: meta.key,
      label: meta.label,
      desc: meta.desc,
      isConfigured: true,
      status: "ACTIVE_CONFIGURED",
      statusBadgeText: "Approved & Active",
      statusBadgeVariant: "success",
      priceDisplayInr: `₹${formattedInr}`,
      pricePaiseValue: card.pricePaise,
      pricePaiseBadgeText: `${card.pricePaise} paise`,
      billingRuleNote: `per delivered message + ${taxPercent}% GST (${taxMode})`,
      illustrativeBenchmarkInr: meta.illustrativeBenchmarkInr,
      illustrativeBenchmarkPaise: meta.illustrativeBenchmarkPaise,
      taxPercent,
      taxMode,
      notes: card.notes,
      effectiveFrom: card.effectiveFrom,
      buttonText: "Update Price",
    };
  }

  return {
    category: meta.key,
    label: meta.label,
    desc: meta.desc,
    isConfigured: false,
    status: "UNRESOLVED_UNCONFIGURED",
    statusBadgeText: "Unconfigured",
    statusBadgeVariant: "warning",
    priceDisplayInr: "Not Configured",
    pricePaiseValue: undefined,
    pricePaiseBadgeText: "No Rate Set",
    billingRuleNote: "No approved rate card • Outbound messages fail closed (BILLING_PRICE_UNRESOLVED)",
    illustrativeBenchmarkInr: meta.illustrativeBenchmarkInr,
    illustrativeBenchmarkPaise: meta.illustrativeBenchmarkPaise,
    taxPercent: 18,
    taxMode: "exclusive",
    notes: undefined,
    effectiveFrom: undefined,
    buttonText: "Configure Approved Price",
  };
}

/**
 * Resolves the initial input value for the price editor modal.
 * When no existing price is configured, returns "" (empty string) so the form
 * never prepopulates an illustrative price that could be mistaken for an approved rate.
 */
export function resolveEditorInitialPrice(currentPricePaise?: number): number | "" {
  if (typeof currentPricePaise === "number" && currentPricePaise > 0) {
    return currentPricePaise;
  }
  return "";
}
