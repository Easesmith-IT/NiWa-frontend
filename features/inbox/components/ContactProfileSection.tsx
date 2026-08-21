import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { ContactAvatar } from "./ContactAvatar";

export interface ContactProfileSectionProps {
  contact: {
    _id: string;
    avatarUrl?: string | null;
    company?: string | null;
    displayName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    profileName?: string | null;
  };
  editingContact: boolean;
  onEditingContactChange: (editing: boolean) => void;
  editDisplayName: string;
  onEditDisplayNameChange: (val: string) => void;
  editCompany: string;
  onEditCompanyChange: (val: string) => void;
  editEmail: string;
  onEditEmailChange: (val: string) => void;
  editAvatarUrl: string;
  onEditAvatarUrlChange: (val: string) => void;
  onSaveContact: () => void;
  isSaving: boolean;
}

export function ContactProfileSection({
  contact,
  editingContact,
  onEditingContactChange,
  editDisplayName,
  onEditDisplayNameChange,
  editCompany,
  onEditCompanyChange,
  editEmail,
  onEditEmailChange,
  editAvatarUrl,
  onEditAvatarUrlChange,
  onSaveContact,
  isSaving,
}: ContactProfileSectionProps) {
  return (
    <div className="px-6 py-6">
      {editingContact ? (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#56675d]">Display name</label>
            <Input
              className="border-[#ddd2c3] bg-white text-[#25342f]"
              onChange={(event) => onEditDisplayNameChange(event.target.value)}
              value={editDisplayName}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#56675d]">Company</label>
            <Input
              className="border-[#ddd2c3] bg-white text-[#25342f]"
              onChange={(event) => onEditCompanyChange(event.target.value)}
              value={editCompany}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#56675d]">Email</label>
            <Input
              className="border-[#ddd2c3] bg-white text-[#25342f]"
              onChange={(event) => onEditEmailChange(event.target.value)}
              value={editEmail}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#56675d]">Avatar URL</label>
            <Input
              className="border-[#ddd2c3] bg-white text-[#25342f]"
              onChange={(event) => onEditAvatarUrlChange(event.target.value)}
              value={editAvatarUrl}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              className="bg-[#2d644d] text-white hover:bg-[#255440]"
              disabled={!editDisplayName.trim() || isSaving}
              onClick={onSaveContact}
              size="sm"
              type="button"
            >
              Save changes
            </Button>
            <Button
              onClick={() => onEditingContactChange(false)}
              size="sm"
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <ContactAvatar
            avatarUrl={contact.avatarUrl}
            className="h-24 w-24 text-2xl"
            name={contact.displayName}
          />
          <h3 className="mt-4 text-[28px] font-semibold tracking-[-0.03em] text-[#25342f]">
            {contact.displayName}
          </h3>
          <p className="mt-2 text-[16px] text-[#56675d]">
            {contact.phoneNumber || "No phone available"}
          </p>
          {contact.profileName && contact.profileName !== contact.displayName ? (
            <p className="mt-1 text-sm text-[#7a8b82]">
              WhatsApp profile: {contact.profileName}
            </p>
          ) : null}
          {contact.company ? (
            <p className="mt-1 text-sm text-[#7a8b82]">{contact.company}</p>
          ) : null}
          <Button
            className="mt-4 border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
            onClick={() => {
              onEditDisplayNameChange(contact.displayName ?? "");
              onEditCompanyChange(contact.company ?? "");
              onEditEmailChange(contact.email ?? "");
              onEditAvatarUrlChange(contact.avatarUrl ?? "");
              onEditingContactChange(true);
            }}
            size="sm"
            type="button"
            variant="secondary"
          >
            Edit contact details
          </Button>
        </div>
      )}
    </div>
  );
}
