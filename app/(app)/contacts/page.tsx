"use client";

import { ContactsShell, useContactsOrchestration } from "../../../features/contacts";

export default function ContactsPage() {
  const orchestration = useContactsOrchestration();
  return <ContactsShell orchestration={orchestration} />;
}
