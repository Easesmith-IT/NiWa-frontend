"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "../../lib/utils";

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export const ThemeSwitcher = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-md border border-transparent bg-transparent" />
    );
  }

  const ActiveIcon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Appearance options"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md text-[#52525B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#176B4D]/20 dark:text-[#B4B7BA]",
          "hover:bg-[#F4F4F5] dark:hover:bg-[#202326]",
          isOpen && "bg-[#F4F4F5] dark:bg-[#202326]",
        )}
        onClick={() => setIsOpen((prev) => !prev)}
        title="Appearance"
        type="button"
      >
        <ActiveIcon className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </button>

      {isOpen ? (
        <div
          aria-orientation="vertical"
          className="absolute right-0 top-full z-50 mt-1.5 w-40 rounded-md border border-[#E4E4E7] bg-white p-1.5 shadow-floating dark:border-[#303438] dark:bg-[#1B1D20] dark:shadow-modal"
          role="menu"
        >
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Appearance
          </div>
          <div className="space-y-0.5" role="none">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.value;

              return (
                <button
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus:outline-none",
                    isSelected
                      ? "bg-[#EDF8F3] text-[#176B4D] dark:bg-[#14251E] dark:text-[#63B592]"
                      : "text-foreground hover:bg-[#F4F4F5] dark:hover:bg-[#25282B]",
                  )}
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value);
                    setIsOpen(false);
                  }}
                  role="menuitem"
                  type="button"
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {option.label}
                  </span>
                  {isSelected ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-[#176B4D] dark:text-[#63B592]" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};
