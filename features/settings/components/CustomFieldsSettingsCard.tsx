"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sliders,
  Eye,
  EyeOff,
  ListFilter,
  X,
} from "lucide-react";
import {
  crmFieldsApi,
  CrmFieldRecordType,
  CrmFieldType,
  CrmFieldDefinition,
  CrmFieldOption,
} from "lib/api/crm-fields-api";

const ENTITY_OPTIONS: Array<{ value: CrmFieldRecordType; label: string; description: string }> = [
  { value: "Product", label: "Products", description: "Catalog items, physical or digital goods" },
  { value: "Supplier", label: "Suppliers", description: "Vendor contacts and procurement sourcing partners" },
  { value: "Person", label: "People / Contacts", description: "Individual CRM contacts and persons" },
  { value: "Company", label: "Companies", description: "B2B organizations and client accounts" },
  { value: "Lead", label: "Leads", description: "Inbound and sales prospect records" },
  { value: "Deal", label: "Deals / Opportunities", description: "Commercial sales pipeline items" },
];

const FIELD_TYPE_OPTIONS: Array<{ value: CrmFieldType; label: string }> = [
  { value: "TEXT", label: "Single-line Text" },
  { value: "LONG_TEXT", label: "Multi-line Text" },
  { value: "NUMBER", label: "Number" },
  { value: "CURRENCY", label: "Currency" },
  { value: "BOOLEAN", label: "Yes / No (Checkbox)" },
  { value: "DATE", label: "Date" },
  { value: "DATE_TIME", label: "Date & Time" },
  { value: "EMAIL", label: "Email Address" },
  { value: "PHONE", label: "Phone Number" },
  { value: "URL", label: "Website URL" },
  { value: "OPTION", label: "Dropdown Select (Single)" },
  { value: "MULTI_OPTION", label: "Multi-Select Options" },
];

export function CustomFieldsSettingsCard() {
  const queryClient = useQueryClient();
  const [selectedEntity, setSelectedEntity] = useState<CrmFieldRecordType>("Product");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [label, setLabel] = useState("");
  const [key, setKey] = useState("");
  const [type, setType] = useState<CrmFieldType>("TEXT");
  const [required, setRequired] = useState(false);
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Inline Option Editor States for Field Creation
  const [newOptions, setNewOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [optionInputLabel, setOptionInputLabel] = useState("");
  const [optionInputValue, setOptionInputValue] = useState("");

  // Managing Options for an Existing Field
  const [managingField, setManagingField] = useState<CrmFieldDefinition | null>(null);
  const [modalOptionLabel, setModalOptionLabel] = useState("");
  const [modalOptionValue, setModalOptionValue] = useState("");
  const [modalOptionError, setModalOptionError] = useState<string | null>(null);

  // Fetch definitions
  const { data: fieldsData, isLoading } = useQuery({
    queryKey: ["crm-field-definitions", selectedEntity],
    queryFn: () => crmFieldsApi.getFieldDefinitions(selectedEntity, true),
  });

  const fieldDefs: CrmFieldDefinition[] = fieldsData?.data || [];

  // Fetch options for the field currently being managed in modal
  const { data: optionsData, isLoading: isLoadingOptions } = useQuery({
    queryKey: ["crm-field-options", managingField?._id],
    queryFn: () => (managingField ? crmFieldsApi.getFieldOptions(managingField._id, true) : null),
    enabled: Boolean(managingField),
  });

  const currentOptions: CrmFieldOption[] = optionsData?.data || [];

  // Create field definition mutation
  const createMutation = useMutation({
    mutationFn: async (data: {
      recordType: CrmFieldRecordType;
      key: string;
      label: string;
      type: CrmFieldType;
      required?: boolean;
      description?: string;
    }) => {
      const res = await crmFieldsApi.createFieldDefinition(data);
      const createdDefId = res.data._id;

      // If field is an option type and options were added in the inline editor, create them
      if ((data.type === "OPTION" || data.type === "MULTI_OPTION") && newOptions.length > 0 && createdDefId) {
        for (let i = 0; i < newOptions.length; i++) {
          try {
            await crmFieldsApi.createFieldOption(createdDefId, {
              label: newOptions[i].label,
              value: newOptions[i].value,
              position: i + 1,
            });
          } catch {
            // Ignore duplicate option failures
          }
        }
      }

      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-field-definitions", selectedEntity] });
      setSuccessMsg("Custom field definition created successfully");
      setShowCreateModal(false);
      setLabel("");
      setKey("");
      setDescription("");
      setRequired(false);
      setType("TEXT");
      setNewOptions([]);
      setOptionInputLabel("");
      setOptionInputValue("");
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 3500);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to create field definition");
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      crmFieldsApi.updateFieldDefinition(id, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-field-definitions", selectedEntity] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => crmFieldsApi.deleteFieldDefinition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-field-definitions", selectedEntity] });
      setSuccessMsg("Field definition deleted successfully");
      setTimeout(() => setSuccessMsg(null), 3000);
    },
  });

  // Add option to existing field mutation
  const addOptionMutation = useMutation({
    mutationFn: async ({
      fieldDefinitionId,
      label: optLabel,
      value: optValue,
    }: {
      fieldDefinitionId: string;
      label: string;
      value: string;
    }) => {
      return crmFieldsApi.createFieldOption(fieldDefinitionId, {
        label: optLabel,
        value: optValue,
        position: currentOptions.length + 1,
      });
    },
    onSuccess: () => {
      if (managingField) {
        queryClient.invalidateQueries({ queryKey: ["crm-field-options", managingField._id] });
      }
      queryClient.invalidateQueries({ queryKey: ["crm-field-definitions", selectedEntity] });
      setModalOptionLabel("");
      setModalOptionValue("");
      setModalOptionError(null);
    },
    onError: (err: any) => {
      setModalOptionError(err.response?.data?.message || err.message || "Failed to add option");
    },
  });

  // Delete option from existing field mutation
  const deleteOptionMutation = useMutation({
    mutationFn: async ({
      fieldDefinitionId,
      optionId,
    }: {
      fieldDefinitionId: string;
      optionId: string;
    }) => {
      return crmFieldsApi.deleteFieldOption(fieldDefinitionId, optionId);
    },
    onSuccess: () => {
      if (managingField) {
        queryClient.invalidateQueries({ queryKey: ["crm-field-options", managingField._id] });
      }
      queryClient.invalidateQueries({ queryKey: ["crm-field-definitions", selectedEntity] });
    },
  });

  const handleLabelChange = (val: string) => {
    setLabel(val);
    if (!key || key === label.toLowerCase().replace(/[^a-z0-9_]/g, "_")) {
      const generated = val
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      setKey(generated);
    }
  };

  const handleAddInlineOption = () => {
    const trimmedLabel = optionInputLabel.trim();
    const trimmedVal = (optionInputValue.trim() || trimmedLabel)
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/^_+|_+$/g, "");

    if (!trimmedLabel) return;
    if (newOptions.some((o) => o.value === trimmedVal)) {
      setErrorMsg(`Option with value '${trimmedVal}' already added`);
      return;
    }

    setNewOptions((prev) => [...prev, { label: trimmedLabel, value: trimmedVal }]);
    setOptionInputLabel("");
    setOptionInputValue("");
    setErrorMsg(null);
  };

  const handleRemoveInlineOption = (index: number) => {
    setNewOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!label.trim()) {
      setErrorMsg("Field Label is required");
      return;
    }

    if (!key.trim()) {
      setErrorMsg("Field Key is required");
      return;
    }

    createMutation.mutate({
      recordType: selectedEntity,
      label: label.trim(),
      key: key.trim(),
      type,
      required,
      description: description.trim() || undefined,
    });
  };

  const handleAddModalOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingField) return;
    setModalOptionError(null);

    const trimmedLabel = modalOptionLabel.trim();
    const trimmedVal = (modalOptionValue.trim() || trimmedLabel)
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/^_+|_+$/g, "");

    if (!trimmedLabel) {
      setModalOptionError("Option label is required");
      return;
    }

    addOptionMutation.mutate({
      fieldDefinitionId: managingField._id,
      label: trimmedLabel,
      value: trimmedVal,
    });
  };

  return (
    <div className="p-5 bg-card border border-[#E4E4E7] dark:border-[#24272A] rounded-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E4E7] dark:border-[#24272A]">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#176B4D]" />
            Custom Fields & Extensible Attributes
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure custom domain fields for products, suppliers, and CRM entities without code modifications.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowCreateModal(true);
            setNewOptions([]);
            setOptionInputLabel("");
            setOptionInputValue("");
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#176B4D] hover:bg-[#13573E] text-white text-xs font-medium transition shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Custom Field
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Entity Selector Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {ENTITY_OPTIONS.map((ent) => (
          <button
            key={ent.value}
            type="button"
            onClick={() => setSelectedEntity(ent.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedEntity === ent.value
                ? "bg-[#176B4D] text-white shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {ent.label}
          </button>
        ))}
      </div>

      {/* Field Definitions Table */}
      {isLoading ? (
        <div className="p-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#176B4D]" />
          Loading field definitions...
        </div>
      ) : fieldDefs.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-[#E4E4E7] dark:border-[#24272A] rounded-xl text-xs text-muted-foreground">
          No custom fields defined for <span className="font-semibold text-foreground">{selectedEntity}</span>.
          Click &quot;Add Custom Field&quot; to create one.
        </div>
      ) : (
        <div className="border border-[#E4E4E7] dark:border-[#24272A] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-[#E4E4E7] dark:border-[#24272A] text-[11px] font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-3 py-2.5">Field Label</th>
                <th className="px-3 py-2.5">Key</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-2.5 py-2.5 text-center">Required</th>
                <th className="px-2.5 py-2.5 text-center">Status</th>
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {fieldDefs.map((field) => {
                const isOptionType = field.type === "OPTION" || field.type === "MULTI_OPTION";
                const optCount = field.options?.length || 0;

                return (
                  <tr key={field._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-foreground">{field.label}</div>
                      {field.description && (
                        <div className="text-[11px] text-muted-foreground">{field.description}</div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">
                      {field.key}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {field.type}
                        </span>
                        {isOptionType && (
                          <button
                            type="button"
                            onClick={() => {
                              setManagingField(field);
                              setModalOptionLabel("");
                              setModalOptionValue("");
                              setModalOptionError(null);
                            }}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition"
                            title="Manage option list"
                          >
                            <ListFilter className="w-3 h-3" />
                            <span>{optCount} options</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-2.5 py-2.5 text-center">
                      {field.required ? (
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Yes</span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">No</span>
                      )}
                    </td>
                    <td className="px-2.5 py-2.5 text-center">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          field.active
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {field.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {isOptionType && (
                          <button
                            type="button"
                            title="Manage Options"
                            onClick={() => {
                              setManagingField(field);
                              setModalOptionLabel("");
                              setModalOptionValue("");
                              setModalOptionError(null);
                            }}
                            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-emerald-600 dark:text-emerald-400"
                          >
                            <ListFilter className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          title={field.active ? "Deactivate field" : "Activate field"}
                          onClick={() =>
                            toggleActiveMutation.mutate({ id: field._id, active: !field.active })
                          }
                          className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground"
                        >
                          {field.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          title="Delete definition"
                          onClick={() => {
                            if (confirm(`Delete custom field "${field.label}"? Existing records will keep stored values.`)) {
                              deleteMutation.mutate(field._id);
                            }
                          }}
                          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Field Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-[#E4E4E7] dark:border-[#24272A] rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#176B4D]" />
              New Custom Field for {selectedEntity}
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Field Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GSTIN, Sourcing Region, Warranty Period"
                  value={label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Machine Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. gstin, sourcing_region"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Unique identifier (letters, numbers, and underscores).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Data Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CrmFieldType)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
                  >
                    {FIELD_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="create-field-required"
                    checked={required}
                    onChange={(e) => setRequired(e.target.checked)}
                    className="w-4 h-4 rounded text-[#176B4D] focus:ring-[#176B4D] border-gray-300"
                  />
                  <label htmlFor="create-field-required" className="text-xs font-medium text-foreground cursor-pointer">
                    Mandatory field
                  </label>
                </div>
              </div>

              {/* Inline Option Editor when OPTION or MULTI_OPTION is selected */}
              {(type === "OPTION" || type === "MULTI_OPTION") && (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-[#E4E4E7] dark:border-[#24272A] rounded-lg space-y-2">
                  <label className="block text-xs font-semibold text-foreground">
                    Predefined Dropdown Options
                  </label>
                  <p className="text-[10px] text-muted-foreground">
                    Add choices available in this dropdown selector. Options can also be managed after creation.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Option label (e.g. Red, Urgent)"
                      value={optionInputLabel}
                      onChange={(e) => {
                        setOptionInputLabel(e.target.value);
                        if (!optionInputValue || optionInputValue === optionInputLabel.toLowerCase().replace(/[^a-z0-9_]/g, "_")) {
                          setOptionInputValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddInlineOption();
                        }
                      }}
                      className="flex-1 px-2.5 py-1.5 text-xs rounded border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={optionInputValue}
                      onChange={(e) => setOptionInputValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddInlineOption();
                        }
                      }}
                      className="w-24 px-2 py-1.5 text-xs font-mono rounded border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
                    />
                    <button
                      type="button"
                      onClick={handleAddInlineOption}
                      className="px-2.5 py-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-xs font-medium rounded transition"
                    >
                      Add
                    </button>
                  </div>

                  {newOptions.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {newOptions.map((opt, idx) => (
                        <span
                          key={opt.value}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-background border border-[#E4E4E7] dark:border-[#24272A] rounded text-[11px] font-medium text-foreground shadow-sm"
                        >
                          <span>{opt.label}</span>
                          <span className="text-[9px] font-mono text-muted-foreground">({opt.value})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveInlineOption(idx)}
                            className="text-muted-foreground hover:text-red-500 ml-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                      Tip: Add at least one option now, or add options later via the Options button.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Description / Help Text
                </label>
                <input
                  type="text"
                  placeholder="Optional hint for operators filling out this field"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E4E4E7] dark:border-[#24272A]">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setErrorMsg(null);
                  }}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-[#E4E4E7] dark:border-[#24272A] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#176B4D] hover:bg-[#13573E] text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Field"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Existing Field Options Manager Modal */}
      {managingField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-[#E4E4E7] dark:border-[#24272A] rounded-xl p-5 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E4E7] dark:border-[#24272A]">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-[#176B4D]" />
                  Manage Options: {managingField.label}
                </h3>
                <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                  Field Key: {managingField.key} ({managingField.type})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManagingField(null)}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalOptionError && (
              <div className="p-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded text-xs text-red-700 dark:text-red-300">
                {modalOptionError}
              </div>
            )}

            {/* Quick Add Option Form */}
            <form onSubmit={handleAddModalOption} className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg space-y-2 border border-[#E4E4E7] dark:border-[#24272A]">
              <span className="block text-xs font-semibold text-foreground">Add New Option</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Option Display Label (e.g. In Stock)"
                  value={modalOptionLabel}
                  onChange={(e) => {
                    setModalOptionLabel(e.target.value);
                    if (!modalOptionValue || modalOptionValue === modalOptionLabel.toLowerCase().replace(/[^a-z0-9_]/g, "_")) {
                      setModalOptionValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"));
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs rounded border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
                />
                <input
                  type="text"
                  placeholder="Value key"
                  value={modalOptionValue}
                  onChange={(e) => setModalOptionValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                  className="w-28 px-2 py-1.5 text-xs font-mono rounded border border-[#E4E4E7] dark:border-[#24272A] bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#176B4D]"
                />
                <button
                  type="submit"
                  disabled={addOptionMutation.isPending || !modalOptionLabel.trim()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#176B4D] hover:bg-[#13573E] text-white text-xs font-medium rounded transition disabled:opacity-50 shrink-0"
                >
                  {addOptionMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Existing Options List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Configured Options ({currentOptions.length})
              </span>

              {isLoadingOptions ? (
                <div className="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#176B4D]" />
                  Loading options...
                </div>
              ) : currentOptions.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-[#E4E4E7] dark:border-[#24272A] rounded-lg text-xs text-muted-foreground">
                  No options created yet for this field definition. Add one using the form above.
                </div>
              ) : (
                <div className="border border-[#E4E4E7] dark:border-[#24272A] rounded-lg divide-y divide-zinc-100 dark:divide-zinc-800">
                  {currentOptions.map((opt) => (
                    <div
                      key={opt._id}
                      className="flex items-center justify-between px-3 py-2 text-xs hover:bg-zinc-50/60 dark:hover:bg-zinc-900/60 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{opt.label}</span>
                        <span className="font-mono text-[10px] text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                          {opt.value}
                        </span>
                        {opt.active === false && (
                          <span className="text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">
                            Inactive
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove option "${opt.label}"?`)) {
                            deleteOptionMutation.mutate({
                              fieldDefinitionId: managingField._id,
                              optionId: opt._id,
                            });
                          }
                        }}
                        disabled={deleteOptionMutation.isPending}
                        className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                        title="Remove option"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E4E4E7] dark:border-[#24272A]">
              <button
                type="button"
                onClick={() => setManagingField(null)}
                className="px-4 py-1.5 text-xs font-medium rounded-lg border border-[#E4E4E7] dark:border-[#24272A] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-foreground"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
