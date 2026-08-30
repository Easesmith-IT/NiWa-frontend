"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Pin, Tags, Trash2, X } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  useAddContactLabelMutation,
  useRemoveContactLabelMutation,
} from "../contact.queries";
import type { ContactRecord } from "../contact.types";
import { withDisplayPhoneNumber } from "../../shared/mappers";
import {
  useContactNotesQuery,
  useCreateContactNoteMutation,
  useDeleteNoteMutation,
  usePatchNoteMutation,
  useSetNotePinnedMutation,
} from "../../notes";
import type { LabelRecord } from "../../labels";
import { RecordTimeline } from "../../activities/components/RecordTimeline";

interface ContactDetailDrawerProps {
  availableLabels: LabelRecord[];
  contact: ContactRecord;
  onClose: () => void;
  onDeleteContact: (contactId: string) => void;
  onOpenChat?: (phoneNumber: string) => void;
  onSaveContact: (contactId: string, payload: Partial<ContactRecord>) => void;
}

export function ContactDetailDrawer({
  availableLabels,
  contact,
  onClose,
  onDeleteContact,
  onOpenChat,
  onSaveContact,
}: ContactDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(contact.displayName);
  const [company, setCompany] = useState(contact.company ?? "");
  const [email, setEmail] = useState(contact.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(contact.phoneNumber);
  const [profileName, setProfileName] = useState(contact.profileName ?? "");
  const [avatarUrl, setAvatarUrl] = useState(contact.avatarUrl ?? "");

  const [noteContent, setNoteContent] = useState("");
  const [notePinned, setNotePinned] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const [selectedLabelId, setSelectedLabelId] = useState("");

  const notesQuery = useContactNotesQuery(contact._id);
  const notes = notesQuery.data?.data ?? [];

  const addLabelMutation = useAddContactLabelMutation();
  const removeLabelMutation = useRemoveContactLabelMutation();
  const createNoteMutation = useCreateContactNoteMutation();
  const patchNoteMutation = usePatchNoteMutation();
  const deleteNoteMutation = useDeleteNoteMutation();
  const setNotePinnedMutation = useSetNotePinnedMutation();

  useEffect(() => {
    setDisplayName(contact.displayName);
    setCompany(contact.company ?? "");
    setEmail(contact.email ?? "");
    setPhoneNumber(contact.phoneNumber);
    setProfileName(contact.profileName ?? "");
    setAvatarUrl(contact.avatarUrl ?? "");
    setIsEditing(false);
  }, [contact]);

  const handleSave = () => {
    onSaveContact(contact._id, {
      avatarUrl: avatarUrl.trim() || undefined,
      company: company.trim() || undefined,
      displayName: displayName.trim(),
      email: email.trim() || undefined,
      phoneNumber: phoneNumber.trim(),
      profileName: profileName.trim() || undefined,
    });
    setIsEditing(false);
  };

  const contactLabels = availableLabels.filter((label) =>
    contact.labels?.includes(label._id),
  );

  return (
    <div className="flex h-full flex-col border-l border-[#E4E4E7] bg-white shadow-subtle dark:border-[#24272A] dark:bg-[#121416]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E4E4E7] px-6 py-5 dark:border-[#24272A]">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Contact details</h2>
          <p className="text-xs text-muted-foreground">CRM profile & notes context</p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenChat ? (
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary-hover"
              onClick={() => onOpenChat(contact.phoneNumber)}
              size="sm"
              type="button"
            >
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
              Chat
            </Button>
          ) : null}
          <button
            className="rounded-full p-2 text-muted-foreground transition hover:bg-[#F4F4F5] hover:text-foreground dark:hover:bg-[#191C1E]"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Body scroll */}
      <div className="niwa-scrollbar flex-1 overflow-y-auto p-6 space-y-6">
        {/* Profile Card */}
        <div className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-subtle text-center dark:border-[#292C2F] dark:bg-[#17191B]">
          {isEditing ? (
            <div className="space-y-3 text-left">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Display Name
                </label>
                <Input
                  onChange={(e) => setDisplayName(e.target.value)}
                  value={displayName}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Phone Number
                </label>
                <Input
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  value={phoneNumber}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Company
                </label>
                <Input
                  onChange={(e) => setCompany(e.target.value)}
                  value={company}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Email
                </label>
                <Input
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  value={email}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  WhatsApp Profile Name
                </label>
                <Input
                  onChange={(e) => setProfileName(e.target.value)}
                  value={profileName}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Custom Avatar URL
                </label>
                <Input
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  disabled={!displayName.trim()}
                  onClick={handleSave}
                  size="sm"
                  type="button"
                  variant="primary"
                >
                  Save changes
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {contact.avatarUrl ? (
                <img
                  alt={contact.displayName}
                  className="h-20 w-20 rounded-full object-cover shadow-xs"
                  referrerPolicy="no-referrer"
                  src={contact.avatarUrl}
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDF8F3] text-xl font-bold text-[#176B4D] dark:bg-[#15271F] dark:text-[#63B592]">
                  {contact.displayName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <h3 className="mt-3 text-xl font-semibold text-foreground">
                {contact.displayName}
              </h3>
              <p className="mt-1 text-sm font-medium text-[#176B4D] dark:text-[#359B76]">
                {withDisplayPhoneNumber(contact.phoneNumber) ?? contact.phoneNumber}
              </p>
              {contact.company ? (
                <p className="mt-1 text-xs text-muted-foreground">{contact.company}</p>
              ) : null}
              {contact.email ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{contact.email}</p>
              ) : null}

              <div className="mt-4 flex gap-2 w-full">
                <Button
                  className="flex-1"
                  onClick={() => setIsEditing(true)}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  Edit profile
                </Button>
                <Button
                  onClick={() => onDeleteContact(contact._id)}
                  size="sm"
                  type="button"
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Labels Section */}
        <div className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-subtle space-y-3 dark:border-[#292C2F] dark:bg-[#17191B]">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Labels & Tags
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {contactLabels.map((label) => (
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                key={label._id}
                style={{ backgroundColor: label.color, color: "#1b2521" }}
              >
                {label.name}
                <button
                  className="hover:opacity-75"
                  onClick={() =>
                    removeLabelMutation.mutate({
                      contactId: contact._id,
                      labelId: label._id,
                    })
                  }
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {contactLabels.length === 0 ? (
              <p className="text-xs text-muted-foreground">No labels assigned yet.</p>
            ) : null}
          </div>
          <div className="flex gap-2 pt-2">
            <select
              className="h-9 flex-1 rounded-lg border border-[#D4D4D8] bg-white px-3 text-xs text-foreground outline-none dark:border-[#303438] dark:bg-[#121416]"
              onChange={(e) => setSelectedLabelId(e.target.value)}
              value={selectedLabelId}
            >
              <option value="">Select a label to add...</option>
              {availableLabels.map((label) => (
                <option key={label._id} value={label._id}>
                  {label.name}
                </option>
              ))}
            </select>
            <Button
              disabled={!selectedLabelId || addLabelMutation.isPending}
              onClick={() =>
                addLabelMutation.mutate(
                  { contactId: contact._id, labelId: selectedLabelId },
                  { onSuccess: () => setSelectedLabelId("") },
                )
              }
              size="sm"
              type="button"
              variant="secondary"
            >
              <Tags className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Notes Section */}
        <div className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-subtle space-y-4 dark:border-[#292C2F] dark:bg-[#17191B]">
          <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Internal Notes
          </h4>
          <Textarea
            className="min-h-20 text-xs"
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Add internal note for this contact..."
            value={noteContent}
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-[#6f7f75]">
              <input
                checked={notePinned}
                onChange={(e) => setNotePinned(e.target.checked)}
                type="checkbox"
              />
              Pin note
            </label>
            <Button
              className="bg-[#2d644d] text-white hover:bg-[#255440]"
              disabled={!noteContent.trim() || createNoteMutation.isPending}
              onClick={() =>
                createNoteMutation.mutate(
                  {
                    contactId: contact._id,
                    payload: { content: noteContent.trim(), pinned: notePinned },
                  },
                  {
                    onSuccess: () => {
                      setNoteContent("");
                      setNotePinned(false);
                    },
                  },
                )
              }
              size="sm"
              type="button"
            >
              Add note
            </Button>
          </div>

          <div className="space-y-3 pt-2">
            {notes.map((note) => (
              <div className="rounded-xl border border-[#eee4d8] bg-[#fbf7f1] p-3 text-xs" key={note._id}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#25342f]">{note.authorName}</span>
                  <button
                    className="text-[#6f7f75] hover:text-[#25342f]"
                    onClick={() =>
                      setNotePinnedMutation.mutate({ noteId: note._id, pinned: !note.pinned })
                    }
                    type="button"
                  >
                    <Pin className={`h-3.5 w-3.5 ${note.pinned ? "text-[#2d644d] fill-[#2d644d]" : ""}`} />
                  </button>
                </div>
                {editingNoteId === note._id ? (
                  <div className="mt-2 space-y-2">
                    <Textarea
                      className="min-h-16 border-[#ddd2c3] bg-white text-xs"
                      onChange={(e) => setEditingNoteContent(e.target.value)}
                      value={editingNoteContent}
                    />
                    <div className="flex gap-2">
                      <Button
                        disabled={!editingNoteContent.trim()}
                        onClick={() =>
                          patchNoteMutation.mutate(
                            { noteId: note._id, payload: { content: editingNoteContent.trim() } },
                            { onSuccess: () => setEditingNoteId(null) },
                          )
                        }
                        size="sm"
                        type="button"
                      >
                        Save
                      </Button>
                      <Button onClick={() => setEditingNoteId(null)} size="sm" type="button" variant="secondary">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1.5 whitespace-pre-wrap text-[#44534d]">{note.content}</p>
                )}
              </div>
            ))}
            {notes.length === 0 ? (
              <p className="text-xs text-[#7a8b82]">No notes recorded yet.</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-subtle space-y-4 dark:border-[#292C2F] dark:bg-[#17191B]">
          <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Activity Timeline
          </h4>
          <RecordTimeline recordType="Person" recordId={contact._id} />
        </div>
      </div>
    </div>
  );
}
