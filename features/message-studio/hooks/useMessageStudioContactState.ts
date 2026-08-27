import { useState } from "react";

export const useMessageStudioContactState = () => {
  const [contactFormattedName, setContactFormattedName] = useState("");
  const [contactFirstName, setContactFirstName] = useState("");
  const [contactLastName, setContactLastName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  return {
    contactFormattedName, setContactFormattedName,
    contactFirstName, setContactFirstName,
    contactLastName, setContactLastName,
    contactPhone, setContactPhone,
  };
};
