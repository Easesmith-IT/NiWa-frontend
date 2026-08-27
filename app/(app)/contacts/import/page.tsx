import { ContactImportWizard } from "../../../../features/contacts";

export const metadata = {
  title: "Import Contacts | NiWa",
  description: "Bulk import your WhatsApp business contacts into NIWA.",
};

export default function ContactsImportPage() {
  return <ContactImportWizard />;
}
