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

  if (normalized.startsWith("+")) {
    return normalized;
  }

  return /^\d+$/.test(normalized) ? `+${normalized}` : normalized;
};
