"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Pencil,
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
  Mail,
  Phone,
  MapPin,
  FileText,
  UserPlus,
  MessageSquare,
  Eye,
} from "lucide-react";
import { apiClient } from "lib/api/api-client";
import { listContacts } from "features/contacts/contact.api";
import { listPeople, createPerson, linkPersonCompany, unlinkPersonCompany } from "features/people/people.api";
import { updateCompany } from "features/companies/company.api";
import type { ContactRecord, CrmCompany, CrmPerson } from "lib/api/api-types";

export default function CompaniesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [website, setWebsite] = useState("");
  const [domain, setDomain] = useState("");
  const [industry, setIndustry] = useState("");
  const [primaryEmail, setPrimaryEmail] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
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
      c.industry?.toLowerCase().includes(term) ||
      c.gstin?.toLowerCase().includes(term) ||
      c.city?.toLowerCase().includes(term)
    );
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: Partial<CrmCompany>) => {
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
      if (selectedCompanyId) setSelectedCompanyId(null);
    },
  });

  const resetForm = () => {
    setName("");
    setLegalName("");
    setGstin("");
    setPan("");
    setWebsite("");
    setDomain("");
    setIndustry("");
    setPrimaryEmail("");
    setPrimaryPhone("");
    setAddress("");
    setCity("");
    setState("");
    setPostalCode("");
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
      legalName: legalName.trim() || undefined,
      gstin: gstin.trim().toUpperCase() || undefined,
      pan: pan.trim().toUpperCase() || undefined,
      website: website.trim() || undefined,
      domain: domain.trim() || undefined,
      industry: industry.trim() || undefined,
      primaryEmail: primaryEmail.trim().toLowerCase() || undefined,
      primaryPhone: primaryPhone.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      postalCode: postalCode.trim() || undefined,
      country: "IN",
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
          await apiClient.post("/api/crm/companies", { name: compName, country: "IN" });
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
            B2B client accounts, tax registrations (GSTIN/PAN), associated people, and communication channels.
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
            placeholder="Search companies by name, GSTIN, city, industry..."
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
                <th className="px-6 py-3 font-semibold">Tax & Identifiers</th>
                <th className="px-6 py-3 font-semibold">Location</th>
                <th className="px-6 py-3 font-semibold">Domain / Web</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredCompanies.map((comp) => (
                <tr
                  key={comp._id}
                  onClick={() => setSelectedCompanyId(comp._id)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                        {comp.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 transition">
                          {comp.name}
                        </div>
                        {comp.industry && (
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">
                            {comp.industry}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-xs">
                      {comp.gstin && (
                        <div className="font-mono text-[11px] text-indigo-700 dark:text-indigo-300">
                          GST: {comp.gstin}
                        </div>
                      )}
                      {comp.pan && (
                        <div className="font-mono text-[11px] text-gray-500">
                          PAN: {comp.pan}
                        </div>
                      )}
                      {!comp.gstin && !comp.pan && <span className="text-gray-400 text-xs">—</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {comp.city || comp.state ? (
                      <div className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {[comp.city, comp.state].filter(Boolean).join(", ")}
                      </div>
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
                        onClick={(e) => e.stopPropagation()}
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
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedCompanyId(comp._id)}
                        className="text-gray-500 hover:text-indigo-600 p-1 rounded-md transition"
                        title="View Company Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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
                    </div>
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
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-200 dark:border-gray-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-base">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Add New Company Account
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

            <form onSubmit={handleCreateSubmit} className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Acme Global Ltd."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Legal / Registered Name
                  </label>
                  <input
                    type="text"
                    placeholder="Acme Global Pvt. Ltd."
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    GSTIN (15 chars)
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="27ABCDE1234F1Z5"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-mono uppercase bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    PAN (10 chars)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="ABCDE1234F"
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-mono uppercase bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    placeholder="Manufacturing, Software"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Primary Email
                  </label>
                  <input
                    type="email"
                    placeholder="accounts@acme.com"
                    value={primaryEmail}
                    onChange={(e) => setPrimaryEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Primary Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 22 1234 5678"
                    value={primaryPhone}
                    onChange={(e) => setPrimaryPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="Plot 42, Industrial Area"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="Maharashtra"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Postal Code</label>
                  <input
                    type="text"
                    placeholder="400001"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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

      {/* COMPANY DETAIL DRAWER */}
      {selectedCompanyId && (
        <CompanyDetailDrawer
          companyId={selectedCompanyId}
          onClose={() => setSelectedCompanyId(null)}
        />
      )}
    </div>
  );
}

function CompanyDetailDrawer({
  companyId,
  onClose,
}: {
  companyId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "people" | "contacts">("overview");
  const [showEditCompany, setShowEditCompany] = useState(false);
  const [selectedPersonIdToLink, setSelectedPersonIdToLink] = useState("");
  const [showCreatePerson, setShowCreatePerson] = useState(false);
  const [newPersonFirst, setNewPersonFirst] = useState("");
  const [newPersonLast, setNewPersonLast] = useState("");
  const [newPersonJobTitle, setNewPersonJobTitle] = useState("");
  const [newPersonEmail, setNewPersonEmail] = useState("");
  const [newPersonPhone, setNewPersonPhone] = useState("");

  const { data: company, isLoading } = useQuery({
    queryKey: ["crm-company-detail", companyId],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: CrmCompany }>(`/api/crm/companies/${companyId}`);
      return res.data.data;
    },
  });

  const { data: allPeople = [] } = useQuery({
    queryKey: ["crm-people"],
    queryFn: () => listPeople(),
  });

  const linkPersonMut = useMutation({
    mutationFn: (personId: string) => linkPersonCompany(personId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-company-detail", companyId] });
      queryClient.invalidateQueries({ queryKey: ["crm-people"] });
      setSelectedPersonIdToLink("");
    },
  });

  const unlinkPersonMut = useMutation({
    mutationFn: (personId: string) => unlinkPersonCompany(personId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-company-detail", companyId] });
      queryClient.invalidateQueries({ queryKey: ["crm-people"] });
    },
  });

  const createPersonForCompanyMut = useMutation({
    mutationFn: (payload: Partial<CrmPerson>) => createPerson(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-company-detail", companyId] });
      queryClient.invalidateQueries({ queryKey: ["crm-people"] });
      setShowCreatePerson(false);
      setNewPersonFirst("");
      setNewPersonLast("");
      setNewPersonJobTitle("");
      setNewPersonEmail("");
      setNewPersonPhone("");
    },
  });

  if (isLoading || !company) {
    return (
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  const people: CrmPerson[] = company.people || [];
  const contacts: ContactRecord[] = company.contacts || [];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 font-bold text-sm">
            {company.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {company.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {company.legalName || company.domain || "B2B Commercial Account"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditCompany(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition"
            title="Edit Company Details"
          >
            <Pencil className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Edit Company</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 px-6">
        <button
          onClick={() => setActiveTab("overview")}
          className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition ${
            activeTab === "overview"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Account Overview
        </button>
        <button
          onClick={() => setActiveTab("people")}
          className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "people"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          People ({people.length})
        </button>
        <button
          onClick={() => setActiveTab("contacts")}
          className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "contacts"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Endpoints ({contacts.length})
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Tax Details */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Tax & Legal Identifiers
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block text-[11px]">GSTIN:</span>
                  <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                    {company.gstin || "Not provided"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">PAN:</span>
                  <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                    {company.pan || "Not provided"}
                  </span>
                </div>
                {company.cin && (
                  <div className="col-span-2">
                    <span className="text-gray-500 block text-[11px]">CIN:</span>
                    <span className="font-mono text-gray-800 dark:text-gray-200">{company.cin}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Address
              </h4>
              <p className="text-xs text-gray-800 dark:text-gray-200">
                {[company.address, company.city, company.state, company.postalCode, company.country]
                  .filter(Boolean)
                  .join(", ") || "No address recorded"}
              </p>
            </div>

            {/* Primary Contact */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Primary Account Contact
              </h4>
              <div className="space-y-1 text-xs">
                {company.primaryEmail && (
                  <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{company.primaryEmail}</span>
                  </div>
                )}
                {company.primaryPhone && (
                  <div className="flex items-center gap-2 text-emerald-600 font-medium">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{company.primaryPhone}</span>
                  </div>
                )}
                {!company.primaryEmail && !company.primaryPhone && (
                  <p className="text-gray-400 italic">No primary contact recorded</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "people" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Associated People ({people.length})
              </h4>
              <button
                type="button"
                onClick={() => setShowCreatePerson(!showCreatePerson)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {showCreatePerson ? "Cancel" : "Add Person"}
              </button>
            </div>

            {showCreatePerson && (
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900 space-y-2.5">
                <h5 className="text-xs font-semibold text-indigo-950 dark:text-indigo-300">
                  New Person at {company.name}
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="First Name *"
                    value={newPersonFirst}
                    onChange={(e) => setNewPersonFirst(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                  <input
                    placeholder="Last Name"
                    value={newPersonLast}
                    onChange={(e) => setNewPersonLast(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                  <input
                    placeholder="Job Title"
                    value={newPersonJobTitle}
                    onChange={(e) => setNewPersonJobTitle(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                  <input
                    placeholder="Email"
                    value={newPersonEmail}
                    onChange={(e) => setNewPersonEmail(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                </div>
                <button
                  type="button"
                  disabled={!newPersonFirst.trim() || createPersonForCompanyMut.isPending}
                  onClick={() =>
                    createPersonForCompanyMut.mutate({
                      firstName: newPersonFirst.trim(),
                      lastName: newPersonLast.trim(),
                      displayName: `${newPersonFirst.trim()} ${newPersonLast.trim()}`.trim(),
                      jobTitle: newPersonJobTitle.trim() || undefined,
                      emails: newPersonEmail.trim() ? [{ email: newPersonEmail.trim(), label: "work", primary: true }] : [],
                      companyIds: [companyId],
                    })
                  }
                  className="w-full text-xs py-1.5 bg-indigo-600 text-white rounded font-medium disabled:opacity-50"
                >
                  Create & Associate
                </button>
              </div>
            )}

            <div className="space-y-2">
              {people.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 font-bold text-xs flex items-center justify-center">
                      {p.displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                        {p.displayName}
                      </div>
                      {p.jobTitle && <div className="text-[11px] text-gray-500">{p.jobTitle}</div>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => unlinkPersonMut.mutate(p._id)}
                    className="text-xs text-red-500 hover:text-red-700 p-1"
                    title="Remove from company"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {people.length === 0 && (
                <p className="text-xs text-gray-400 italic">No people associated with this company yet.</p>
              )}
            </div>

            {/* Link Existing Person */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Link Existing Person:
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedPersonIdToLink}
                  onChange={(e) => setSelectedPersonIdToLink(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                >
                  <option value="">Select person...</option>
                  {allPeople
                    .filter((person) => !people.some((p) => p._id === person._id))
                    .map((person) => (
                      <option key={person._id} value={person._id}>
                        {person.displayName} {person.jobTitle ? `(${person.jobTitle})` : ""}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  disabled={!selectedPersonIdToLink || linkPersonMut.isPending}
                  onClick={() => linkPersonMut.mutate(selectedPersonIdToLink)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg disabled:opacity-50"
                >
                  Link
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "contacts" && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Communication Endpoints ({contacts.length})
            </h4>

            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact._id}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">
                      WA
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                        {contact.displayName}
                      </div>
                      <div className="text-[11px] text-emerald-600 font-medium">
                        {contact.phoneNumber}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 px-2 py-0.5 rounded">
                    {contact.channel || "WHATSAPP"}
                  </span>
                </div>
              ))}

              {contacts.length === 0 && (
                <p className="text-xs text-gray-400 italic">No communication endpoints linked directly to this Company.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EditCompanyModal({
  company,
  onClose,
  onSuccess,
}: {
  company: CrmCompany;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(company.name || "");
  const [legalName, setLegalName] = useState(company.legalName || "");
  const [gstin, setGstin] = useState(company.gstin || "");
  const [pan, setPan] = useState(company.pan || "");
  const [cin, setCin] = useState(company.cin || "");
  const [website, setWebsite] = useState(company.website || "");
  const [domain, setDomain] = useState(company.domain || "");
  const [industry, setIndustry] = useState(company.industry || "");
  const [primaryEmail, setPrimaryEmail] = useState(company.primaryEmail || "");
  const [primaryPhone, setPrimaryPhone] = useState(company.primaryPhone || "");
  const [address, setAddress] = useState(company.address || "");
  const [city, setCity] = useState(company.city || "");
  const [state, setState] = useState(company.state || "");
  const [postalCode, setPostalCode] = useState(company.postalCode || "");
  const [country, setCountry] = useState(company.country || "IN");
  const [status, setStatus] = useState(company.status || "ACTIVE");
  const [notes, setNotes] = useState(company.notes || "");
  const [formError, setFormError] = useState("");

  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<CrmCompany>) => {
      return updateCompany(company._id, payload);
    },
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || err.message || "Failed to update company");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Company name is required");
      return;
    }

    if (gstin.trim()) {
      const gstinRegex = /^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[1-9A-Za-z]{1}[zZ]{1}[0-9A-Za-z]{1}$/;
      if (!gstinRegex.test(gstin.trim())) {
        setFormError("Invalid GSTIN format (must be 15 characters, e.g. 27AAACR5055K1ZX)");
        return;
      }
    }

    if (pan.trim()) {
      const panRegex = /^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/;
      if (!panRegex.test(pan.trim())) {
        setFormError("Invalid PAN format (must be 10 characters, e.g. AAACR5055K)");
        return;
      }
    }

    if (cin.trim()) {
      const cinRegex = /^[A-Za-z]{1}[0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6}$/;
      if (!cinRegex.test(cin.trim())) {
        setFormError("Invalid CIN format (must be 21 characters, e.g. L01631KA2010PTC096843)");
        return;
      }
    }

    if (primaryEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(primaryEmail.trim())) {
        setFormError("Invalid primary email format");
        return;
      }
    }

    updateMutation.mutate({
      name: name.trim(),
      legalName: legalName.trim() || undefined,
      gstin: gstin.trim().toUpperCase() || undefined,
      pan: pan.trim().toUpperCase() || undefined,
      cin: cin.trim().toUpperCase() || undefined,
      website: website.trim() || undefined,
      domain: domain.trim() || undefined,
      industry: industry.trim() || undefined,
      primaryEmail: primaryEmail.trim() || undefined,
      primaryPhone: primaryPhone.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      postalCode: postalCode.trim() || undefined,
      country: country.trim() || "IN",
      status,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Edit Company</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Update company details, Indian tax identifiers, and addresses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Basic Information
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Legal / Registered Name
                </label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Website
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Domain
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Indian Business & Tax Identifiers
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  GSTIN (15 chars)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-mono uppercase bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  PAN (10 chars)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-mono uppercase bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  CIN (21 chars)
                </label>
                <input
                  type="text"
                  maxLength={21}
                  value={cin}
                  onChange={(e) => setCin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-mono uppercase bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Contact Channels
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Primary Email
                </label>
                <input
                  type="email"
                  value={primaryEmail}
                  onChange={(e) => setPrimaryEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Primary Phone
                </label>
                <input
                  type="text"
                  value={primaryPhone}
                  onChange={(e) => setPrimaryPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Structured Address
            </h4>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Street Address / Line 1
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="ACTIVE">Active</option>
                <option value="PROSPECT">Prospect</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
