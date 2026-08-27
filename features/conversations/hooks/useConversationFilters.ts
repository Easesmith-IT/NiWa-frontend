import { useState } from "react";
import type { FilterMode } from "../conversations.types";

export const useConversationFilters = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  return {
    searchQuery,
    setSearchQuery,
    filterMode,
    setFilterMode,
  };
};
