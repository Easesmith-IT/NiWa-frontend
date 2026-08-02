"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ContactRound,
  FileText,
  GitMerge,
  PencilLine,
  Pin,
  Plus,
  Tags,
  Trash2,
  Upload,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  useContactDuplicatesV1Query,
  useContactsV1Query,
  useCreateContactV1Mutation,
  useDeleteContactV1Mutation,
  useImportContactsV1Mutation,
  useMergeContactsV1Mutation,
  usePatchContactV1Mutation,
} from "../../../features/contacts";
import { exportContactsV1 } from "../../../features/contacts/contact.api";
import {
  useCreateLabelV1Mutation,
  useDeleteLabelV1Mutation,
  useLabelsV1Query,
  usePatchLabelV1Mutation,
} from "../../../features/labels";
import {
  useContactNotesV1Query,
  useCreateContactNoteV1Mutation,
  useDeleteNoteV1Mutation,
  usePatchNoteV1Mutation,
  useSetNotePinnedV1Mutation,
} from "../../../features/notes";

const defaultContactDraft = {
  company: "",
  displayName: "",
  email: "",
  phoneNumber: "",
  profileName: "",
};

const defaultLabelDraft = {
  color: "#d9c27b",
  description: "",
  name: "",
  slug: "",
};

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [contactDraft, setContactDraft] = useState(defaultContactDraft);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [isCreatingContact, setIsCreatingContact] = useState(false);
  const [contactFeedback, setContactFeedback] = useState<{
    message: string;
    tone: "error" | "success";
  } | null>(null);
  const [labelDraft, setLabelDraft] = useState(defaultLabelDraft);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [notePinned, setNotePinned] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const [importPayload, setImportPayload] = useState("");
  const [duplicateField, setDuplicateField] = useState<"phoneNumber" | "phoneNumberE164" | "waId">(
    "phoneNumberE164",
  );
  const [mergeSourceId, setMergeSourceId] = useState("");
  const [mergeTargetId, setMergeTargetId] = useState("");

  const contactsQuery = useContactsV1Query({ search });
  const duplicateGroupsQuery = useContactDuplicatesV1Query({ field: duplicateField });
  const labelsQuery = useLabelsV1Query();
  const createContactMutation = useCreateContactV1Mutation();
  const patchContactMutation = usePatchContactV1Mutation();
  const deleteContactMutation = useDeleteContactV1Mutation();
  const importContactsMutation = useImportContactsV1Mutation();
  const mergeContactsMutation = useMergeContactsV1Mutation();
  const createLabelMutation = useCreateLabelV1Mutation();
  const patchLabelMutation = usePatchLabelV1Mutation();
  const deleteLabelMutation = useDeleteLabelV1Mutation();
  const createNoteMutation = useCreateContactNoteV1Mutation();
  const patchNoteMutation = usePatchNoteV1Mutation();
  const deleteNoteMutation = useDeleteNoteV1Mutation();
  const setNotePinnedMutation = useSetNotePinnedV1Mutation();

  const contacts = contactsQuery.data?.data ?? [];
  const labels = labelsQuery.data?.data ?? [];
  const duplicateGroups = duplicateGroupsQuery.data?.data ?? [];

  const selectedContact = useMemo(
    () => contacts.find((contact) => contact._id === selectedContactId) ?? null,
    [contacts, selectedContactId],
  );

  const notesQuery = useContactNotesV1Query(selectedContact?._id ?? "");
  const notes = notesQuery.data?.data ?? [];

  useEffect(() => {
    if (!isCreatingContact && !selectedContactId && contacts[0]?._id) {
      setSelectedContactId(contacts[0]._id);
    }
  }, [contacts, isCreatingContact, selectedContactId]);

  useEffect(() => {
    if (!isCreatingContact && selectedContact && selectedContact._id !== editingContactId) {
      setContactDraft({
        company: selectedContact.company ?? "",
        displayName: selectedContact.displayName,
        email: selectedContact.email ?? "",
        phoneNumber: selectedContact.phoneNumber,
        profileName: selectedContact.profileName ?? "",
      });
      setEditingContactId(selectedContact._id);
    }

    if (!selectedContact && editingContactId && !isCreatingContact) {
      setContactDraft(defaultContactDraft);
      setEditingContactId(null);
    }
  }, [editingContactId, isCreatingContact, selectedContact]);

  const handleContactSubmit = () => {
    const payload = {
      company: contactDraft.company.trim() || undefined,
      displayName: contactDraft.displayName.trim(),
      email: contactDraft.email.trim() || undefined,
      phoneNumber: contactDraft.phoneNumber.trim(),
      phoneNumberE164: contactDraft.phoneNumber.trim(),
      profileName: contactDraft.profileName.trim() || undefined,
      waId: contactDraft.phoneNumber.trim(),
    };

    setContactFeedback(null);

    if (!isCreatingContact && editingContactId && selectedContact?._id === editingContactId) {
      patchContactMutation.mutate(
        {
          contactId: editingContactId,
          payload,
        },
        {
          onSuccess: (result) => {
            setContactFeedback({
              message: "Contact saved successfully.",
              tone: "success",
            });
            setSelectedContactId(result.data._id);
            setEditingContactId(result.data._id);
          },
          onError: (error) => {
            setContactFeedback({
              message: error instanceof Error ? error.message : "Contact could not be saved.",
              tone: "error",
            });
          },
        },
      );
      return;
    }

    createContactMutation.mutate(payload, {
      onSuccess: (result) => {
        setContactFeedback({
          message: "Contact created successfully.",
          tone: "success",
        });
        setIsCreatingContact(false);
        setSelectedContactId(result.data._id);
        setEditingContactId(result.data._id);
        setContactDraft({
          company: result.data.company ?? "",
          displayName: result.data.displayName,
          email: result.data.email ?? "",
          phoneNumber: result.data.phoneNumber,
          profileName: result.data.profileName ?? "",
        });
      },
      onError: (error) => {
        setContactFeedback({
          message: error instanceof Error ? error.message : "Contact could not be created.",
          tone: "error",
        });
      },
    });
  };

  const enterCreateContactMode = () => {
    setIsCreatingContact(true);
    setSelectedContactId(null);
    setEditingContactId(null);
    setContactDraft(defaultContactDraft);
    setContactFeedback(null);
  };

  const resetContactEditor = () => {
    setContactFeedback(null);

    if (isCreatingContact) {
      setContactDraft(defaultContactDraft);
      return;
    }

    if (!selectedContact) {
      setContactDraft(defaultContactDraft);
      setEditingContactId(null);
      return;
    }

    setContactDraft({
      company: selectedContact.company ?? "",
      displayName: selectedContact.displayName,
      email: selectedContact.email ?? "",
      phoneNumber: selectedContact.phoneNumber,
      profileName: selectedContact.profileName ?? "",
    });
  };

  const handleLabelSubmit = () => {
    const payload = {
      color: labelDraft.color.trim(),
      description: labelDraft.description.trim() || undefined,
      name: labelDraft.name.trim(),
      slug: labelDraft.slug.trim() || labelDraft.name.trim().toLowerCase().replace(/\s+/g, "-"),
    };

    if (editingLabelId) {
      patchLabelMutation.mutate({
        labelId: editingLabelId,
        payload,
      });
      return;
    }

    createLabelMutation.mutate(payload, {
      onSuccess: () => {
        setLabelDraft(defaultLabelDraft);
      },
    });
  };

  const handleExport = async (format: "csv" | "json") => {
    const result = await exportContactsV1({
      format,
      search: search || undefined,
    });

    if (format === "json") {
      const jsonBlob = new Blob([JSON.stringify(result, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(jsonBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "niwa-v1-contacts.json";
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    const url = URL.createObjectURL(result as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "niwa-v1-contacts.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(244,239,229,0.95))] p-6 shadow-[0_18px_50px_rgba(44,56,38,0.08)] lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Contacts
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Customer registry</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Stage 4 now includes maintenance flows for imports, duplicate cleanup, note editing,
            and contact merges instead of leaving them as backend-only utilities.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Input
            className="min-w-[240px] rounded-2xl bg-white/85"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search contacts"
            value={search}
          />
          <Button
            className="rounded-full"
            onClick={() => {
              enterCreateContactMode();
            }}
            type="button"
            variant="secondary"
          >
            <Plus className="mr-2 h-4 w-4" />
            New contact
          </Button>
          <Button className="rounded-full" onClick={() => void handleExport("csv")} type="button" variant="secondary">
            <ArrowDownToLine className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_430px_380px]">
        <div className="space-y-4">
          <Card className="space-y-4 border-white/60 bg-white/75 p-5 backdrop-blur">
            {contacts.map((contact) => {
              const isActive = selectedContact?._id === contact._id;

              return (
                <button
                  className={`w-full rounded-[1.4rem] border p-4 text-left transition ${
                    isActive
                      ? "border-[#244b42] bg-[#16362f] text-[#f8f1de]"
                      : "border-transparent bg-[#faf7ef] hover:border-[#d9cfb8] hover:bg-white"
                  }`}
                  key={contact._id}
                  onClick={() => {
                    setIsCreatingContact(false);
                    setSelectedContactId(contact._id);
                    setContactFeedback(null);
                  }}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <ContactRound className="h-4 w-4" />
                        <p className="text-sm font-semibold">{contact.displayName}</p>
                      </div>
                      <p className={`mt-2 text-sm ${isActive ? "text-[#d7e7dd]" : "text-muted-foreground"}`}>
                        {contact.phoneNumber}
                      </p>
                      <p className={`mt-1 text-sm ${isActive ? "text-[#d7e7dd]" : "text-muted-foreground"}`}>
                        {contact.company || "No company set"}
                      </p>
                    </div>
                    <div className={`text-right text-xs ${isActive ? "text-[#d7e7dd]" : "text-muted-foreground"}`}>
                      <p>{contact.profileName || "No profile name"}</p>
                    </div>
                  </div>
                </button>
              );
            })}
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contacts matched this search.</p>
            ) : null}
          </Card>

          <Card className="space-y-4 border-white/60 bg-white/78 p-5 backdrop-blur">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Import
                </p>
                <h2 className="mt-1 text-lg font-semibold">Bulk contacts</h2>
              </div>
            </div>
            <Textarea
              className="min-h-36 rounded-[1.4rem] bg-[#faf7ef]"
              onChange={(event) => setImportPayload(event.target.value)}
              placeholder='[{"displayName":"Anita Sharma","phoneNumber":"9198...","phoneNumberE164":"9198...","waId":"9198...","profileName":"Anita","customFields":[]}]'
              value={importPayload}
            />
            <div className="flex gap-2">
              <Button
                className="flex-1 rounded-full"
                disabled={!importPayload.trim() || importContactsMutation.isPending}
                onClick={() => {
                  try {
                    const parsed = JSON.parse(importPayload) as Array<Record<string, unknown>>;
                    importContactsMutation.mutate(
                      {
                        contacts: parsed.map((item) => ({
                          company: typeof item.company === "string" ? item.company : undefined,
                          customFields: [],
                          displayName: String(item.displayName ?? ""),
                          email: typeof item.email === "string" ? item.email : undefined,
                          phoneNumber: String(item.phoneNumber ?? ""),
                          phoneNumberE164: String(item.phoneNumberE164 ?? item.phoneNumber ?? ""),
                          profileName: typeof item.profileName === "string" ? item.profileName : undefined,
                          waId: String(item.waId ?? item.phoneNumberE164 ?? item.phoneNumber ?? ""),
                        })),
                      },
                      {
                        onSuccess: () => setImportPayload(""),
                      },
                    );
                  } catch {
                    return;
                  }
                }}
                type="button"
                variant="secondary"
              >
                Import JSON
              </Button>
              <Button className="rounded-full" onClick={() => void handleExport("json")} type="button" variant="secondary">
                Export JSON
              </Button>
            </div>
          </Card>

          <Card className="space-y-4 border-white/60 bg-white/78 p-5 backdrop-blur">
            <div className="flex items-center gap-2">
              <GitMerge className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Duplicate review
                </p>
                <h2 className="mt-1 text-lg font-semibold">Merge registry</h2>
              </div>
            </div>
            <select
              className="h-11 rounded-2xl border border-border bg-[#faf7ef] px-3 text-sm outline-none"
              onChange={(event) =>
                setDuplicateField(event.target.value as "phoneNumber" | "phoneNumberE164" | "waId")
              }
              value={duplicateField}
            >
              <option value="phoneNumberE164">Phone E164</option>
              <option value="phoneNumber">Phone</option>
              <option value="waId">waId</option>
            </select>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                onChange={(event) => setMergeSourceId(event.target.value)}
                placeholder="Source contact id"
                value={mergeSourceId}
              />
              <Input
                onChange={(event) => setMergeTargetId(event.target.value)}
                placeholder="Target contact id"
                value={mergeTargetId}
              />
            </div>
            <Button
              className="w-full rounded-full"
              disabled={!mergeSourceId.trim() || !mergeTargetId.trim() || mergeContactsMutation.isPending}
              onClick={() =>
                mergeContactsMutation.mutate(
                  {
                    sourceContactId: mergeSourceId.trim(),
                    targetContactId: mergeTargetId.trim(),
                  },
                  {
                    onSuccess: () => {
                      setMergeSourceId("");
                      setMergeTargetId("");
                    },
                  },
                )
              }
              type="button"
              variant="secondary"
            >
              Merge contacts
            </Button>
            <div className="space-y-3">
              {duplicateGroups.map((group) => (
                <div className="rounded-[1.3rem] bg-[#faf7ef] p-3" key={`${group.value}-${group.count}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {group.value} | {group.count} matches
                  </p>
                  <div className="mt-2 space-y-2">
                    {group.contacts.map((contact) => (
                      <div className="rounded-xl bg-white/70 px-3 py-2 text-sm" key={contact._id}>
                        <p className="font-medium">{contact.displayName}</p>
                        <p className="text-xs text-muted-foreground">{contact._id}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {duplicateGroups.length === 0 ? (
                <p className="text-sm text-muted-foreground">No duplicate groups found for this field.</p>
              ) : null}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="space-y-4 border-white/60 bg-white/78 p-5 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Contact record
                </p>
                <h2 className="mt-1 text-lg font-semibold">
                  {isCreatingContact ? "Create contact" : selectedContact ? "Edit contact" : "Select a contact"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isCreatingContact
                    ? "Add a new customer record without losing your current list context."
                    : selectedContact
                      ? "Update the selected contact and save changes in one place."
                      : "Pick a contact from the list or create a new one."}
                </p>
              </div>
              {!isCreatingContact && selectedContact ? (
                <Button
                  className="rounded-full"
                  disabled={deleteContactMutation.isPending}
                  onClick={() =>
                    deleteContactMutation.mutate(selectedContact._id, {
                      onSuccess: () => {
                        setSelectedContactId(null);
                        setEditingContactId(null);
                        setContactDraft(defaultContactDraft);
                      },
                    })
                  }
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="rounded-full bg-[#f3ede4] px-3 py-1 text-[#52645c]">
                {isCreatingContact ? "Create mode" : "Edit mode"}
              </span>
              {!isCreatingContact && selectedContact ? (
                <span className="rounded-full bg-[#f3ede4] px-3 py-1 text-[#52645c]">
                  {selectedContact.phoneNumber}
                </span>
              ) : null}
            </div>
            {contactFeedback ? (
              <div
                className={`rounded-[1.2rem] border px-4 py-3 text-sm ${
                  contactFeedback.tone === "success"
                    ? "border-[#bfd8c6] bg-[#eef8f0] text-[#244b42]"
                    : "border-[#e6c2bc] bg-[#fdf0ee] text-[#9a3d33]"
                }`}
              >
                {contactFeedback.message}
              </div>
            ) : null}
            <Input
              onChange={(event) =>
                setContactDraft((current) => ({ ...current, displayName: event.target.value }))
              }
              placeholder="Display name"
              value={contactDraft.displayName}
            />
            <Input
              onChange={(event) =>
                setContactDraft((current) => ({ ...current, phoneNumber: event.target.value }))
              }
              placeholder="Phone number / waId"
              value={contactDraft.phoneNumber}
            />
            <Input
              onChange={(event) =>
                setContactDraft((current) => ({ ...current, profileName: event.target.value }))
              }
              placeholder="Profile name"
              value={contactDraft.profileName}
            />
            <Input
              onChange={(event) =>
                setContactDraft((current) => ({ ...current, company: event.target.value }))
              }
              placeholder="Company"
              value={contactDraft.company}
            />
            <Input
              onChange={(event) =>
                setContactDraft((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="Email"
              value={contactDraft.email}
            />
            <div className="flex gap-2">
              <Button
                className="flex-1 rounded-full"
                disabled={
                  !contactDraft.displayName.trim() ||
                  !contactDraft.phoneNumber.trim() ||
                  createContactMutation.isPending ||
                  patchContactMutation.isPending
                }
                onClick={handleContactSubmit}
                type="button"
              >
                <PencilLine className="mr-2 h-4 w-4" />
                {isCreatingContact
                  ? createContactMutation.isPending
                    ? "Creating..."
                    : "Create contact"
                  : patchContactMutation.isPending
                    ? "Saving..."
                    : "Save contact"}
              </Button>
              <Button
                className="rounded-full"
                onClick={resetContactEditor}
                type="button"
                variant="secondary"
              >
                {isCreatingContact ? "Clear" : "Reset"}
              </Button>
            </div>
          </Card>

          <Card className="space-y-4 border-white/60 bg-white/78 p-5 backdrop-blur">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Notes
                </p>
                <h2 className="mt-1 text-lg font-semibold">Contact notes</h2>
              </div>
            </div>
            <Textarea
              className="min-h-24 rounded-[1.4rem] bg-[#faf7ef]"
              onChange={(event) => setNoteContent(event.target.value)}
              placeholder="Capture internal context for the selected contact"
              value={noteContent}
            />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                checked={notePinned}
                onChange={(event) => setNotePinned(event.target.checked)}
                type="checkbox"
              />
              Pin note
            </label>
            <Button
              className="w-full rounded-full"
              disabled={!selectedContact?._id || !noteContent.trim() || createNoteMutation.isPending}
              onClick={() =>
                selectedContact?._id &&
                createNoteMutation.mutate(
                  {
                    contactId: selectedContact._id,
                    payload: {
                      content: noteContent.trim(),
                      pinned: notePinned,
                    },
                  },
                  {
                    onSuccess: () => {
                      setNoteContent("");
                      setNotePinned(false);
                    },
                  },
                )
              }
              type="button"
              variant="secondary"
            >
              Add note
            </Button>
            <div className="space-y-3">
              {notes.map((note) => (
                <div className="rounded-[1.3rem] bg-[#faf7ef] p-3" key={note._id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{note.authorName}</p>
                    <div className="flex items-center gap-2">
                      {note.pinned ? (
                        <span className="rounded-full bg-[#e4d4a6] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5d4918]">
                          Pinned
                        </span>
                      ) : null}
                      <Button
                        className="rounded-full"
                        onClick={() =>
                          setNotePinnedMutation.mutate({
                            noteId: note._id,
                            pinned: !note.pinned,
                          })
                        }
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        <Pin className="mr-2 h-4 w-4" />
                        {note.pinned ? "Unpin" : "Pin"}
                      </Button>
                    </div>
                  </div>
                  {editingNoteId === note._id ? (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        className="min-h-20 rounded-[1.2rem] bg-white"
                        onChange={(event) => setEditingNoteContent(event.target.value)}
                        value={editingNoteContent}
                      />
                      <div className="flex gap-2">
                        <Button
                          className="rounded-full"
                          disabled={!editingNoteContent.trim() || patchNoteMutation.isPending}
                          onClick={() =>
                            patchNoteMutation.mutate(
                              {
                                noteId: note._id,
                                payload: { content: editingNoteContent.trim() },
                              },
                              {
                                onSuccess: () => {
                                  setEditingNoteId(null);
                                  setEditingNoteContent("");
                                },
                              },
                            )
                          }
                          size="sm"
                          type="button"
                        >
                          Save
                        </Button>
                        <Button
                          className="rounded-full"
                          onClick={() => {
                            setEditingNoteId(null);
                            setEditingNoteContent("");
                          }}
                          size="sm"
                          type="button"
                          variant="secondary"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                      {note.content}
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <Button
                      className="rounded-full"
                      onClick={() => {
                        setEditingNoteId(note._id);
                        setEditingNoteContent(note.content);
                      }}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      Edit
                    </Button>
                    <Button
                      className="rounded-full"
                      disabled={deleteNoteMutation.isPending}
                      onClick={() => deleteNoteMutation.mutate(note._id)}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {selectedContact && notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notes exist for this contact yet.</p>
              ) : null}
              {!selectedContact ? (
                <p className="text-sm text-muted-foreground">Select a contact to manage notes.</p>
              ) : null}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="space-y-4 border-white/60 bg-white/75 p-5 backdrop-blur">
            <div className="flex items-center gap-2">
              <Tags className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Labels
                </p>
                <h2 className="mt-1 text-lg font-semibold">Tag registry</h2>
              </div>
            </div>
            <Input
              onChange={(event) =>
                setLabelDraft((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Label name"
              value={labelDraft.name}
            />
            <Input
              onChange={(event) =>
                setLabelDraft((current) => ({ ...current, slug: event.target.value }))
              }
              placeholder="Slug"
              value={labelDraft.slug}
            />
            <Input
              onChange={(event) =>
                setLabelDraft((current) => ({ ...current, color: event.target.value }))
              }
              placeholder="#d9c27b"
              value={labelDraft.color}
            />
            <Textarea
              className="min-h-20 rounded-[1.4rem] bg-[#faf7ef]"
              onChange={(event) =>
                setLabelDraft((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Description"
              value={labelDraft.description}
            />
            <Button
              className="w-full rounded-full"
              disabled={!labelDraft.name.trim() || !labelDraft.color.trim()}
              onClick={handleLabelSubmit}
              type="button"
            >
              {editingLabelId ? "Save label" : "Create label"}
            </Button>
            <div className="space-y-3">
              {labels.map((label) => (
                <div className="rounded-[1.3rem] bg-[#faf7ef] p-3" key={label._id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        <p className="text-sm font-medium">{label.name}</p>
                      </div>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {label.slug}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {label.description || "No description"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        className="rounded-full"
                        onClick={() => {
                          setEditingLabelId(label._id);
                          setLabelDraft({
                            color: label.color,
                            description: label.description ?? "",
                            name: label.name,
                            slug: label.slug,
                          });
                        }}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        Edit
                      </Button>
                      <Button
                        className="rounded-full"
                        disabled={deleteLabelMutation.isPending}
                        onClick={() => deleteLabelMutation.mutate(label._id)}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {labels.length === 0 ? (
                <p className="text-sm text-muted-foreground">No labels created yet.</p>
              ) : null}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
