"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Check, ChevronDown, Globe, Search, X } from "lucide-react";
import {
  META_SUPPORTED_LANGUAGES,
  searchLanguages,
  MetaLanguage,
} from "../meta-languages";

interface SearchableLanguageSelectProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export function SearchableLanguageSelect({
  value,
  onChange,
  disabled = false,
}: SearchableLanguageSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedLanguage = useMemo(
    () => META_SUPPORTED_LANGUAGES.find((l) => l.code === value) || {
      code: value,
      name: value,
      region: "",
    },
    [value],
  );

  const filteredLanguages = useMemo(
    () => searchLanguages(searchQuery),
    [searchQuery],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto focus search input when opened
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (lang: MetaLanguage) => {
    onChange(lang.code);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`flex h-9 w-full items-center justify-between rounded-md border border-[#D4D4D8] bg-white px-2.5 py-1 text-xs text-foreground transition-colors hover:border-primary focus:border-primary focus:outline-none dark:border-[#303438] dark:bg-[#121416] ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        type="button"
      >
        <span className="flex items-center gap-2 truncate">
          <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="font-medium text-foreground">
            {selectedLanguage.name}
          </span>
          <span className="text-[11px] text-muted-foreground">
            ({selectedLanguage.code})
          </span>
          {selectedLanguage.region ? (
            <span className="hidden sm:inline-block rounded bg-[#F4F4F5] px-1.5 py-0.2 text-[10px] text-muted-foreground dark:bg-[#1C1F21]">
              {selectedLanguage.region}
            </span>
          ) : null}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-72 w-full min-w-[280px] overflow-hidden rounded-md border border-[#E4E4E7] bg-white shadow-lg dark:border-[#292C2F] dark:bg-[#151719]">
          {/* Search Input */}
          <div className="sticky top-0 border-b border-[#E4E4E7] bg-white p-2 dark:border-[#292C2F] dark:bg-[#151719]">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                className="h-8 w-full rounded border border-[#E4E4E7] bg-[#F7F8FA] pl-8 pr-7 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#1A1C1E]"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search languages or countries (e.g. India, Hindi, es)..."
                ref={searchInputRef}
                value={searchQuery}
              />
              {searchQuery ? (
                <button
                  className="absolute right-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchQuery("")}
                  type="button"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Languages List */}
          <div className="max-h-56 overflow-y-auto p-1">
            {filteredLanguages.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground">
                No languages found matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = lang.code === value;
                return (
                  <button
                    className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-[#EDF8F3] font-medium text-[#176B4D] dark:bg-[#13251E] dark:text-[#359B76]"
                        : "text-foreground hover:bg-[#F4F4F5] dark:hover:bg-[#1F2224]"
                    }`}
                    key={lang.code}
                    onClick={() => handleSelect(lang)}
                    type="button"
                  >
                    <div className="flex flex-col truncate pr-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <span>{lang.name}</span>
                        {lang.nativeName ? (
                          <span className="text-[11px] text-muted-foreground">
                            ({lang.nativeName})
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className="font-mono">{lang.code}</span>
                        {lang.region ? <span>• {lang.region}</span> : null}
                      </div>
                    </div>
                    {isSelected ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-[#176B4D] dark:text-[#359B76]" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
