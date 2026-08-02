import { TemplateRecord } from "./api/types";

const activeTemplateSort = (left: TemplateRecord, right: TemplateRecord) => {
  if (left.name !== right.name) {
    return left.name.localeCompare(right.name);
  }

  return left.language.localeCompare(right.language);
};

export const getActiveTemplates = (templates: TemplateRecord[]) =>
  templates
    .filter((template) => template.status === "APPROVED" && template.isSendable !== false)
    .sort(activeTemplateSort);

export const buildTemplateOptionValue = (template: Pick<TemplateRecord, "language" | "name">) =>
  `${template.name}::${template.language}`;

export const parseTemplateOptionValue = (value: string) => {
  const [name = "", language = ""] = value.split("::");

  return {
    language,
    name,
  };
};

export const findTemplateByOptionValue = (templates: TemplateRecord[], value: string) => {
  const { language, name } = parseTemplateOptionValue(value);

  if (!name || !language) {
    return null;
  }

  return (
    templates.find((template) => template.name === name && template.language === language) ?? null
  );
};
