export const getContactVariableDefaults = (contact?: {
  company?: string | null;
  displayName?: string;
  phoneNumber?: string;
  profileName?: string | null;
}) => {
  const displayName = contact?.displayName ?? "";
  const firstName = displayName.trim().split(/\s+/)[0] ?? "";

  return {
    company: contact?.company ?? "",
    displayName,
    firstName,
    name: displayName,
    phoneNumber: contact?.phoneNumber ?? "",
    profileName: contact?.profileName ?? "",
  };
};

export const extractTemplateVariables = (body: string, explicitVariables: string[]) => {
  const placeholders = Array.from(body.matchAll(/{{\s*([^}]+?)\s*}}/g))
    .map((match) => match[1]?.trim())
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set([...explicitVariables, ...placeholders]));
};

export const resolveQuickReplyBody = (
  body: string,
  variables: string[],
  values: Record<string, string>,
) =>
  body.replace(/{{\s*([^}]+?)\s*}}/g, (_match, rawName: string) => {
    const name = rawName.trim();

    if (name in values) {
      return values[name] ?? "";
    }

    const numericIndex = Number(name);
    if (!Number.isNaN(numericIndex) && numericIndex >= 1) {
      return values[variables[numericIndex - 1] ?? ""] ?? "";
    }

    return "";
  });

export const areVariableValuesEqual = (
  left: Record<string, string>,
  right: Record<string, string>,
) => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key) => left[key] === right[key]);
};
