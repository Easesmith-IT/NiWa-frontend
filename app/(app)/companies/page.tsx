"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Plus,
  Search,
  Globe,
  Briefcase,
  Users,
  Sparkles,
  Loader2,
  X,
  ExternalLink,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "lib/api/api-client";
import { listContacts } from "features/contacts/contact.api";
import type { ContactRecord } from "features/contacts/contact.types";

export interface CrmCompany {
  _id: string;
  name: string;
  normalizedName?: string;
  website?: string;
  domain?: string;
  industry?: string;
  employeeCount?: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function CompaniesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [domain, setDomain] = useState("");
  const [industry, setIndustry] = useState("");
  const [formError, setFormError] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractNotice, setExtractNotice] = useState<string | null>(null);

  // 1. Fetch Companies
  const { data: companiesData, isLoading } = useQuery({
    queryKey: ["crm-companies"],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: CrmCompany[] }>("/api/crm/companies", {
        params: { limit: 100 },
      });
      return res.data.data;
    },
  });

  const companies = companiesData || [];

  // 2. Fetch Contacts for extraction
  const { data: contactsData } = useQuery({
    queryKey: ["contacts-for-companies"],
    queryFn: () => listContacts({ limit: 200 }),
  });

  const contactList: ContactRecord[] = (contactsData as any)?.data || [];

  // Filtered companies
  const filteredCompanies = companies.filter((c) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(term) ||
      c.domain?.toLowerCase().includes(term) ||
      c.industry?.toLowerCase().includes(term)
    );
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; website?: string; domain?: string; industry?: string }) => {
      const res = await apiClient.post<{ success: boolean; data: CrmCompany }>("/api/crm/companies", payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-companies"] });
      setShowCreateModal(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || err.message || "Failed to create company");
    },
  });

  // Archive Mutation
  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/crm/companies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-companies"] });
    },
  });

  const resetForm = () => {
    setName("");
    setWebsite("");
    setDomain("");
    setIndustry("");
    setFormError("");
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Company name is required");
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      website: website.trim() || undefined,
      domain: domain.trim() || undefined,
      industry: industry.trim() || undefined,
    });
  };

  // Extract from contacts
  const handleExtractFromContacts = async () => {
    setExtractNotice(null);
    setIsExtracting(true);
    try {
      const existingNames = new Set(companies.map((c) => c.name.toLowerCase().trim()));
      const candidates = new Set<string>();

      contactList.forEach((c) => {
        if (c.company && c.company.trim()) {
          candidates.add(c.company.trim());
        }
      });

      const toAdd = Array.from(candidates).filter((n) => !existingNames.has(n.toLowerCase()));

      if (toAdd.length === 0) {
        setExtractNotice("No new company names found in your existing contacts.");
        return;
      }

      let created = 0;
      for (const compName of toAdd) {
        try {
          await apiClient.post("/api/crm/companies", { name: compName });
          created++;
        } catch {
          // Ignore individual duplicate errors
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["crm-companies"] });
      setExtractNotice(`Successfully extracted and created ${created} company record(s) from your contacts!`);
    } catch (err: any) {
      setExtractNotice("Error extracting companies: " + err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Companies
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            B2B client organizations and commercial account registry for CRM deals and sales orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExtractFromContacts}
            disabled={isExtracting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition disabled:opacity-50"
          >
            {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-indigo-600" />}
            Extract from Contacts
          </button>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {extractNotice && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg text-xs flex items-center justify-between">
          <span>{extractNotice}</span>
          <button onClick={() => setExtractNotice(null)} className="text-indigo-500 hover:text-indigo-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search companies by name, domain, industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="text-xs text-gray-500">
          Total: <span className="font-semibold text-gray-800 dark:text-gray-200">{filteredCompanies.length}</span> companies
        </div>
      </div>

      {/* Table / Empty State */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Loading companies...</div>
        ) : filteredCompanies.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">No companies found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Companies represent your commercial accounts. Add your first company or import company names directly from your WhatsApp contacts.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleExtractFromContacts}
                disabled={isExtracting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Extract from Contacts
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Company
              </button>
            </div>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase text-gray-500 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3 font-semibold">Company Name</th>
                <th className="px-6 py-3 font-semibold">Industry</th>
                <th className="px-6 py-3 font-semibold">Domain / Website</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredCompanies.map((comp) => (
                <tr key={comp._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      {comp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span>{comp.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    {comp.industry ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        {comp.industry}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {comp.website || comp.domain ? (
                      <a
                        href={comp.website?.startsWith("http") ? comp.website : `https://${comp.website || comp.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        {comp.domain || comp.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Archive company '${comp.name}'?`)) {
                          archiveMutation.mutate(comp._id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 p-1 rounded-md transition"
                      title="Archive Company"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE COMPANY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-base">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Add New Company
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Autofill from contact */}
            {contactList.some((c) => c.company && c.company.trim()) && (
              <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-lg">
                <label className="block text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
                  Autofill from Contact's company name (optional):
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      setName(e.target.value);
                    }
                  }}
                  className="w-full text-xs px-2.5 py-1.5 rounded border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                >
                  <option value="">Select a contact company...</option>
                  {Array.from(new Set(contactList.map((c) => c.company?.trim()).filter(Boolean) as string[])).map((comp: string) => (
                    <option key={comp} value={comp}>
                      {comp}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Acme Global Ltd."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  placeholder="e.g., Manufacturing, Software, Retail"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Domain
                  </label>
                  <input
                    type="text"
                    placeholder="acme.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    placeholder="https://acme.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Save Company"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
