import { useState } from "react";

export const useMessageStudioInteractiveState = () => {
  // Buttons
  const [buttonHeader, setButtonHeader] = useState("");
  const [buttonBody, setButtonBody] = useState("");
  const [buttonFooter, setButtonFooter] = useState("");
  const [buttonRows, setButtonRows] = useState("");

  // List
  const [listHeader, setListHeader] = useState("");
  const [listBody, setListBody] = useState("");
  const [listFooter, setListFooter] = useState("");
  const [listButtonText, setListButtonText] = useState("");
  const [listRows, setListRows] = useState("");

  // Reaction
  const [reactionMessageId, setReactionMessageId] = useState("");
  const [reactionEmoji, setReactionEmoji] = useState("");

  // CTA URL
  const [ctaHeader, setCtaHeader] = useState("");
  const [ctaBody, setCtaBody] = useState("");
  const [ctaFooter, setCtaFooter] = useState("");
  const [ctaDisplayText, setCtaDisplayText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");

  // Location Request
  const [locationRequestBody, setLocationRequestBody] = useState("");

  // Typing
  const [typingMessageId, setTypingMessageId] = useState("");

  return {
    buttonHeader, setButtonHeader,
    buttonBody, setButtonBody,
    buttonFooter, setButtonFooter,
    buttonRows, setButtonRows,
    listHeader, setListHeader,
    listBody, setListBody,
    listFooter, setListFooter,
    listButtonText, setListButtonText,
    listRows, setListRows,
    reactionMessageId, setReactionMessageId,
    reactionEmoji, setReactionEmoji,
    ctaHeader, setCtaHeader,
    ctaBody, setCtaBody,
    ctaFooter, setCtaFooter,
    ctaDisplayText, setCtaDisplayText,
    ctaUrl, setCtaUrl,
    locationRequestBody, setLocationRequestBody,
    typingMessageId, setTypingMessageId,
  };
};
