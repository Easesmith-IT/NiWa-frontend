/**
 * NIWA Sales — Multi-Currency Formatter
 * Authoritative client-side financial presentation using native Intl.NumberFormat.
 *
 * Requirements:
 * - Purely presentational: never replaces mathematical calculations from money.ts
 * - Uses persisted document currency
 * - Gracefully handles missing/invalid currencies with safe fallback
 * - Formats valid numeric values to 2 decimal places with locale-appropriate grouping
 */

export const COMMON_CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar", name: "USD — US Dollar ($)" },
  { code: "INR", symbol: "₹", label: "Indian Rupee", name: "INR — Indian Rupee (₹)" },
  { code: "EUR", symbol: "€", label: "Euro", name: "EUR — Euro (€)" },
  { code: "GBP", symbol: "£", label: "British Pound", name: "GBP — British Pound (£)" },
  { code: "AED", symbol: "AED", label: "UAE Dirham", name: "AED — UAE Dirham (د.إ)" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen", name: "JPY — Japanese Yen (¥)" },
  { code: "CAD", symbol: "$", label: "Canadian Dollar", name: "CAD — Canadian Dollar ($)" },
  { code: "AUD", symbol: "$", label: "Australian Dollar", name: "AUD — Australian Dollar ($)" },
  { code: "SGD", symbol: "$", label: "Singapore Dollar", name: "SGD — Singapore Dollar ($)" },
  { code: "CNY", symbol: "¥", label: "Chinese Yuan", name: "CNY — Chinese Yuan (¥)" },
  { code: "SAR", symbol: "﷼", label: "Saudi Riyal", name: "SAR — Saudi Riyal (﷼)" },
  { code: "CHF", symbol: "CHF", label: "Swiss Franc", name: "CHF — Swiss Franc (CHF)" },
  { code: "BRL", symbol: "R$", label: "Brazilian Real", name: "BRL — Brazilian Real (R$)" },
  { code: "ZAR", symbol: "R", label: "South African Rand", name: "ZAR — South African Rand (R)" },
  { code: "NZD", symbol: "$", label: "New Zealand Dollar", name: "NZD — New Zealand Dollar ($)" },
  { code: "THB", symbol: "฿", label: "Thai Baht", name: "THB — Thai Baht (฿)" },
  { code: "MXN", symbol: "$", label: "Mexican Peso", name: "MXN — Mexican Peso ($)" },
  { code: "HKD", symbol: "$", label: "Hong Kong Dollar", name: "HKD — Hong Kong Dollar ($)" },
  { code: "SEK", symbol: "kr", label: "Swedish Krona", name: "SEK — Swedish Krona (kr)" },
  { code: "NOK", symbol: "kr", label: "Norwegian Krone", name: "NOK — Norwegian Krone (kr)" },
];

export const DEFAULT_CURRENCY = "INR";

/**
 * Normalizes a currency code to uppercase 3-letter ISO code or defaults to "INR".
 */
export function normalizeCurrencyCode(currency?: string | null): string {
  if (!currency || typeof currency !== "string") {
    return DEFAULT_CURRENCY;
  }
  const clean = currency.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(clean) ? clean : DEFAULT_CURRENCY;
}

/**
 * Formats a monetary amount into a currency string using native Intl.NumberFormat.
 *
 * @param amount - The numeric or string monetary value
 * @param currency - The 3-letter ISO-4217 currency code (e.g. "USD", "INR", "EUR")
 * @param locale - Optional user locale string (defaults to browser locale or "en-US")
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency?: string | null,
  locale?: string
): string {
  const numericAmount =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
      ? parseFloat(amount)
      : 0;

  const safeAmount = isNaN(numericAmount) ? 0 : numericAmount;
  const isoCode = normalizeCurrencyCode(currency);

  try {
    return new Intl.NumberFormat(locale || undefined, {
      style: "currency",
      currency: isoCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    // Graceful fallback if Intl cannot resolve the specific currency in the current runtime
    return `${isoCode} ${safeAmount.toFixed(2)}`;
  }
}

/**
 * Retrieves the currency symbol or prefix string for a given currency code.
 *
 * @param currency - The 3-letter ISO-4217 currency code (e.g. "USD", "INR")
 * @param locale - Optional user locale string
 */
export function getCurrencySymbol(
  currency?: string | null,
  locale?: string
): string {
  const isoCode = normalizeCurrencyCode(currency);

  try {
    const formatter = new Intl.NumberFormat(locale || undefined, {
      style: "currency",
      currency: isoCode,
    });
    const parts = formatter.formatToParts(0);
    const symbolPart = parts.find((p) => p.type === "currency");
    return symbolPart ? symbolPart.value : isoCode;
  } catch {
    return isoCode;
  }
}
