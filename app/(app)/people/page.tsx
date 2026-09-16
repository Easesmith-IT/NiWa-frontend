"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Pencil,
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Eye,
  UserPlus,
  Unlink,
} from "lucide-react";
import { apiClient } from "lib/api/api-client";
import type { CrmPerson, CrmCompany, ContactRecord } from "lib/api/api-types";
import { listPeople, createPerson, updatePerson, archivePerson, getPerson, linkPersonCompany, unlinkPersonCompany } from "features/people/people.api";
import { listContacts, linkContactPerson, unlinkContactPerson } from "features/contacts/contact.api";

export default function PeoplePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "LEAD">("ACTIVE");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  // 1. Fetch People
  const { data: peopleData, isLoading } = useQuery({
    queryKey: ["crm-people"],
    queryFn: () => listPeople(),
  });

  const people = peopleData || [];

  // 2. Fetch Companies for linking
  const { data: companiesData } = useQuery({
    queryKey: ["crm-companies"],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: CrmCompany[] }>("/api/crm/companies");
      return res.data.data;
    },
  });
  const companies = companiesData || [];

  // Filtered people
  const filteredPeople = people.filter((p) => {
    if (statusFilter !== "ALL" && (p.status || "ACTIVE") !== statusFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const nameMatch = p.displayName?.toLowerCase().includes(term);
    const emailMatch = p.emails?.some((e) => e.email.toLowerCase().includes(term));
    const phoneMatch = p.phones?.some((ph) => ph.phone.includes(term));
    const jobMatch = p.jobTitle?.toLowerCase().includes(term) || p.department?.toLowerCase().includes(term);
    return nameMatch || emailMatch || phoneMatch || jobMatch;
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: Partial<CrmPerson>) => {
      return createPerson(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-people"] });
      setShowCreateModal(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || err.message || "Failed to create person");
    },
  });

  // Archive Mutation
  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      await archivePerson(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-people"] });
      if (selectedPersonId) setSelectedPersonId(null);
    },
  });

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setJobTitle("");
    setDepartment("");
    setEmail("");
    setPhone("");
    setSelectedCompanyId("");
    setStatus("ACTIVE");
    setNotes("");
    setFormError("");
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() && !lastName.trim()) {
      setFormError("At least first or last name is required");
      return;
    }

    const emails = email.trim() ? [{ email: email.trim(), label: "work", primary: true }] : [];
    const phones = phone.trim() ? [{ phone: phone.trim(), label: "mobile", primary: true }] : [];
    const companyIds = selectedCompanyId ? [selectedCompanyId] : [];

    createMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
      jobTitle: jobTitle.trim() || undefined,
      department: department.trim() || undefined,
      emails,
      phones,
      companyIds,
      status,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            People
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Customer human identities, personal contact endpoints, roles, and company affiliations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            Add Person
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search people by name, email, phone, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="LEAD">Lead</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <div className="text-xs text-gray-500">
            Total: <span className="font-semibold text-gray-800 dark:text-gray-200">{filteredPeople.length}</span> people
          </div>
        </div>
      </div>

      {/* Table / Empty State */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Loading people...</div>
        ) : filteredPeople.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">No people found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              People represent real human contacts. Add a person or link an incoming WhatsApp contact to a Person profile.
            </p>
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add First Person
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase text-gray-500 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3 font-semibold">Person</th>
                  <th className="px-6 py-3 font-semibold">Contact Info</th>
                  <th className="px-6 py-3 font-semibold">Company Affiliation</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredPeople.map((person) => {
                  const primaryEmail = person.emails?.find((e) => e.primary)?.email || person.emails?.[0]?.email;
                  const primaryPhone = person.phones?.find((p) => p.primary)?.phone || person.phones?.[0]?.phone;

                  return (
                    <tr key={person._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition cursor-pointer" onClick={() => setSelectedPersonId(person._id)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-xs shrink-0">
                            {person.displayName ? person.displayName.slice(0, 2).toUpperCase() : "P"}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white hover:text-emerald-600 transition">
                              {person.displayName}
                            </div>
                            {(person.jobTitle || person.department) && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                <Briefcase className="w-3 h-3" />
                                {[person.jobTitle, person.department].filter(Boolean).join(" · ")}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-xs">
                          {primaryEmail && (
                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              <span>{primaryEmail}</span>
                            </div>
                          )}
                          {primaryPhone && (
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                              <Phone className="w-3.5 h-3.5" />
                              <span>{primaryPhone}</span>
                            </div>
                          )}
                          {!primaryEmail && !primaryPhone && (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {person.companyIds && person.companyIds.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {person.companyIds.map((c: any) => {
                              const compName = typeof c === "object" ? c.name : companies.find((item) => item._id === c)?.name || "Company";
                              return (
                                <span key={typeof c === "object" ? c._id : c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                                  <Building2 className="w-3 h-3 text-indigo-500" />
                                  {compName}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          person.status === "ACTIVE"
                            ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800"
                            : person.status === "LEAD"
                            ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                            : "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400"
                        }`}>
                          {person.status || "ACTIVE"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedPersonId(person._id)}
                            className="text-gray-500 hover:text-emerald-600 p-1 rounded-md transition"
                            title="View Person Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Archive person '${person.displayName}'?`)) {
                                archiveMutation.mutate(person._id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 p-1 rounded-md transition"
                            title="Archive Person"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {/* CREATE PERSON MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-200 dark:border-gray-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-base">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                Add New Person
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

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    placeholder="Procurement Manager"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="Purchasing"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    placeholder="john@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Associated Company
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">None / Independent individual</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="LEAD">Lead</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Internal Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Key decision maker"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Create Person"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PERSON DETAIL DRAWER */}
      {selectedPersonId && (
        <PersonDetailDrawer
          personId={selectedPersonId}
          onClose={() => setSelectedPersonId(null)}
          companies={companies}
        />
      )}
    </div>
  );
}

function PersonDetailDrawer({
  personId,
  onClose,
  companies,
}: {
  personId: string;
  onClose: () => void;
  companies: CrmCompany[];
}) {
  const queryClient = useQueryClient();
  const [newCompanyId, setNewCompanyId] = useState("");
  const [showEditPerson, setShowEditPerson] = useState(false);

  const { data: person, isLoading } = useQuery({
    queryKey: ["crm-person-detail", personId],
    queryFn: () => getPerson(personId),
  });

  const linkCompanyMutation = useMutation({
    mutationFn: (companyId: string) => linkPersonCompany(personId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-person-detail", personId] });
      queryClient.invalidateQueries({ queryKey: ["crm-people"] });
      setNewCompanyId("");
    },
  });

  const unlinkCompanyMutation = useMutation({
    mutationFn: (companyId: string) => unlinkPersonCompany(personId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-person-detail", personId] });
      queryClient.invalidateQueries({ queryKey: ["crm-people"] });
    },
  });

  const [selectedContactToLink, setSelectedContactToLink] = useState("");

  const { data: contactsData } = useQuery({
    queryKey: ["contacts-for-linking"],
    queryFn: () => listContacts({ limit: 100 }),
  });
  const allContacts: ContactRecord[] = (contactsData as any)?.data || [];

  const linkContactMutation = useMutation({
    mutationFn: (contactId: string) => linkContactPerson(contactId, personId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-person-detail", personId] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setSelectedContactToLink("");
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || "Failed to link contact endpoint");
    },
  });

  const unlinkContactMutation = useMutation({
    mutationFn: (contactId: string) => unlinkContactPerson(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-person-detail", personId] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });

  if (isLoading || !person) {
    return (
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  const associatedCompanies: CrmCompany[] = (person.companies || (person.companyIds as any) || []).map((c: any) =>
    typeof c === "object" ? c : companies.find((item) => item._id === c) || { _id: c, name: "Company" }
  );

  const linkedContacts: ContactRecord[] = person.contacts || [];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm">
            {person.displayName ? person.displayName.slice(0, 2).toUpperCase() : "P"}
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {person.displayName}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {[person.jobTitle, person.department].filter(Boolean).join(" · ") || "Individual Contact"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditPerson(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition"
            title="Edit Person Details"
          >
            <Pencil className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Edit Person</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* EDIT PERSON MODAL */}
      {showEditPerson && (
        <EditPersonModal
          person={person}
          onClose={() => setShowEditPerson(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["crm-person-detail", personId] });
            queryClient.invalidateQueries({ queryKey: ["crm-people"] });
          }}
        />
      )}

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Contact Info Card */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Contact Details
          </h4>
          <div className="space-y-2 text-xs">
            {person.emails && person.emails.length > 0 ? (
              person.emails.map((e, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{e.email}</span>
                  </div>
                  {e.primary && (
                    <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-semibold px-1.5 py-0.5 rounded">
                      PRIMARY
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic">No emails recorded</p>
            )}

            {person.phones && person.phones.length > 0 ? (
              person.phones.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{p.phone}</span>
                  </div>
                  {p.primary && (
                    <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-semibold px-1.5 py-0.5 rounded">
                      PRIMARY
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic">No phone numbers recorded</p>
            )}
          </div>
        </div>

        {/* Associated Companies */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Associated Companies ({associatedCompanies.length})
            </h4>
          </div>

          <div className="space-y-2">
            {associatedCompanies.map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  <div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                      {c.name}
                    </div>
                    {c.domain && <div className="text-[11px] text-gray-500">{c.domain}</div>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => unlinkCompanyMutation.mutate(c._id)}
                  className="text-xs text-red-500 hover:text-red-700 p-1"
                  title="Remove association"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {associatedCompanies.length === 0 && (
              <p className="text-xs text-gray-400 italic">Not associated with any company account.</p>
            )}
          </div>

          {/* Add Company Linker */}
          <div className="flex items-center gap-2 pt-1">
            <select
              value={newCompanyId}
              onChange={(e) => setNewCompanyId(e.target.value)}
              className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
            >
              <option value="">Link another company...</option>
              {companies
                .filter((comp) => !associatedCompanies.some((ac) => ac._id === comp._id))
                .map((comp) => (
                  <option key={comp._id} value={comp._id}>
                    {comp.name}
                  </option>
                ))}
            </select>
            <button
              type="button"
              disabled={!newCompanyId || linkCompanyMutation.isPending}
              onClick={() => linkCompanyMutation.mutate(newCompanyId)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg disabled:opacity-50"
            >
              Link
            </button>
          </div>
        </div>

        {/* Linked Communication Contacts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Linked Communication Endpoints ({linkedContacts.length})
            </h4>
          </div>

          <div className="space-y-2">
            {linkedContacts.map((contact) => (
              <div
                key={contact._id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-xs font-bold">
                    WA
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                      {contact.displayName}
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      {contact.phoneNumber}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                    {contact.channel || "WHATSAPP"}
                  </span>
                  <button
                    type="button"
                    onClick={() => unlinkContactMutation.mutate(contact._id)}
                    disabled={unlinkContactMutation.isPending}
                    className="text-xs text-red-500 hover:text-red-700 p-1 rounded"
                    title="Unlink endpoint from Person"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {linkedContacts.length === 0 && (
              <p className="text-xs text-gray-400 italic">No communication channels linked directly to this Person.</p>
            )}
          </div>

          {/* Link Existing Contact Endpoint */}
          <div className="flex items-center gap-2 pt-1">
            <select
              value={selectedContactToLink}
              onChange={(e) => setSelectedContactToLink(e.target.value)}
              className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
            >
              <option value="">Link communication endpoint...</option>
              {allContacts
                .filter((c) => !linkedContacts.some((lc) => lc._id === c._id))
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.displayName} ({c.phoneNumber})
                  </option>
                ))}
            </select>
            <button
              type="button"
              disabled={!selectedContactToLink || linkContactMutation.isPending}
              onClick={() => linkContactMutation.mutate(selectedContactToLink)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg disabled:opacity-50"
            >
              Link Endpoint
            </button>
          </div>
        </div>

        {/* Notes */}
        {person.notes && (
          <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1">
            <h5 className="text-[11px] font-semibold text-gray-500">Internal Notes</h5>
            <p className="text-xs text-gray-700 dark:text-gray-300">{person.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function EditPersonModal({
  person,
  onClose,
  onSuccess,
}: {
  person: CrmPerson;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const nameParts = (person.displayName || "").trim().split(/\s+/);
  const fallbackFirst = person.firstName || (nameParts.length > 0 && nameParts[0] ? nameParts[0] : "");
  const fallbackLast = person.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");

  const [firstName, setFirstName] = useState(fallbackFirst);
  const [lastName, setLastName] = useState(fallbackLast);
  const [jobTitle, setJobTitle] = useState(person.jobTitle || "");
  const [department, setDepartment] = useState(person.department || "");
  const [email, setEmail] = useState(person.emails?.[0]?.email || "");
  const [phone, setPhone] = useState(person.phones?.[0]?.phone || "");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "LEAD">(person.status || "ACTIVE");
  const [notes, setNotes] = useState(person.notes || "");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const parts = (person.displayName || "").trim().split(/\s+/);
    setFirstName(person.firstName || (parts.length > 0 && parts[0] ? parts[0] : ""));
    setLastName(person.lastName || (parts.length > 1 ? parts.slice(1).join(" ") : ""));
    setJobTitle(person.jobTitle || "");
    setDepartment(person.department || "");
    setEmail(person.emails?.[0]?.email || "");
    setPhone(person.phones?.[0]?.phone || "");
    setStatus(person.status || "ACTIVE");
    setNotes(person.notes || "");
  }, [person]);

  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<CrmPerson>) => {
      return updatePerson(person._id, payload);
    },
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || err.message || "Failed to update person");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedFirst && !trimmedLast && !person.displayName) {
      setFormError("At least first name or last name is required");
      return;
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setFormError("Invalid email address format");
        return;
      }
    }

    const emails = email.trim()
      ? [{ email: email.trim().toLowerCase(), label: "work", primary: true }]
      : [];

    const phones = phone.trim()
      ? [{ phone: phone.trim(), label: "mobile", primary: true }]
      : [];

    const computedDisplayName = `${trimmedFirst} ${trimmedLast}`.trim() || person.displayName || "Unnamed Person";

    updateMutation.mutate({
      firstName: trimmedFirst,
      lastName: trimmedLast,
      displayName: computedDisplayName,
      jobTitle: jobTitle.trim(),
      department: department.trim(),
      emails,
      phones,
      status,
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Edit Person</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Update individual profile, organizational title, and contact details</p>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Primary Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="ACTIVE">Active</option>
                <option value="LEAD">Lead</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Internal Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
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
