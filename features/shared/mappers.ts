export const withNullableText = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
};

export const withDisplayPhoneNumber = (value?: string | null) => {
  const normalized = withNullableText(value);

  if (!normalized) {
    return null;
  }

  const rawDigits = normalized.replace(/^\+/, "").trim();

  if (!/^\d+$/.test(rawDigits)) {
    return normalized;
  }

  if (rawDigits.startsWith("91") && rawDigits.length === 12) {
    return `+91 ${rawDigits.slice(2)}`;
  }

  if (rawDigits.startsWith("1") && rawDigits.length === 11) {
    return `+1 ${rawDigits.slice(1)}`;
  }

  if (rawDigits.startsWith("44") && rawDigits.length === 12) {
    return `+44 ${rawDigits.slice(2)}`;
  }

  if (rawDigits.length === 12) {
    return `+${rawDigits.slice(0, 2)} ${rawDigits.slice(2)}`;
  }

  if (rawDigits.length === 11) {
    return `+${rawDigits.slice(0, 1)} ${rawDigits.slice(1)}`;
  }

  if (rawDigits.length === 13) {
    return `+${rawDigits.slice(0, 3)} ${rawDigits.slice(3)}`;
  }

  return `+${rawDigits}`;
};
