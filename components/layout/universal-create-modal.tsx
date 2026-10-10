"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  CheckSquare,
  FileText,
  PackagePlus,
  Plus,
  Search,
  ShoppingCart,
  ShoppingBag,
  Target,
  UserPlus,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { useWorkspaceModules } from "../../lib/workspace/use-workspace-modules";

export interface UniversalCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLead: () => void;
  onSelectDeal: () => void;
  onSelectTask: () => void;
  onSelectContact: () => void;
}

export interface CreateOptionConfig {
  id: string;
  title: string;
  description: string;
  category: "CRM & Sales" | "Operations & Inventory" | "Productivity";
  moduleKey?: string;
  directRoute?: string;
  modalAction?: "lead" | "deal" | "contact" | "task";
}

export const UNIVERSAL_CREATE_CONFIG: CreateOptionConfig[] = [
  {
    id: "lead",
    title: "New Lead",
    description: "Capture potential prospect with source, expected value, and contact.",
    category: "CRM & Sales",
    moduleKey: "crm",
    modalAction: "lead",
  },
  {
    id: "deal",
    title: "New Deal",
    description: "Track pipeline opportunity, stage progress, and revenue potential.",
    category: "CRM & Sales",
    moduleKey: "crm",
    modalAction: "deal",
  },
  {
    id: "quote",
    title: "New Quotation",
    description: "Prepare customer quotation with pricing, taxes, and expiration.",
    category: "CRM & Sales",
    moduleKey: "sales",
    directRoute: "/sales/quotes?action=create",
  },
  {
    id: "sales-order",
    title: "New Sales Order",
    description: "Generate sales order for fulfillment and invoicing.",
    category: "CRM & Sales",
    moduleKey: "sales",
    directRoute: "/sales/orders?action=create",
  },
  {
    id: "contact",
    title: "New Contact",
    description: "Create customer or company record with phone and WhatsApp info.",
    category: "CRM & Sales",
    moduleKey: "crm",
    modalAction: "contact",
  },
  {
    id: "product",
    title: "New Product",
    description: "Add inventory SKU, variant options, pricing, and unit assignments.",
    category: "Operations & Inventory",
    moduleKey: "products",
    directRoute: "/products/new",
  },
  {
    id: "purchase-order",
    title: "New Purchase Order",
    description: "Procure inventory items and raw stock from verified suppliers.",
    category: "Operations & Inventory",
    moduleKey: "purchasing",
    directRoute: "/purchasing/orders/new",
  },
  {
    id: "task",
    title: "New Task",
    description: "Schedule follow-up, customer action, or team deadline.",
    category: "Productivity",
    moduleKey: "crm",
    modalAction: "task",
  },
];

export function filterCreateOptionsByEnabledModules(
  config: CreateOptionConfig[],
  enabledModuleKeys: Set<string> | string[]
): CreateOptionConfig[] {
  const set = enabledModuleKeys instanceof Set ? enabledModuleKeys : new Set(enabledModuleKeys);
  return config.filter((opt) => !opt.moduleKey || set.has(opt.moduleKey));
}

const OPTION_ICONS: Record<string, React.ElementType> = {
  lead: Target,
  deal: Briefcase,
  quote: FileText,
  "sales-order": ShoppingBag,
  contact: UserPlus,
  product: PackagePlus,
  "purchase-order": ShoppingCart,
  task: CheckSquare,
};

interface CreateOption extends CreateOptionConfig {
  icon: React.ElementType;
  badge?: string;
  action: () => void;
}

export const UniversalCreateModal: React.FC<UniversalCreateModalProps> = ({
  isOpen,
  onClose,
  onSelectLead,
  onSelectDeal,
  onSelectTask,
  onSelectContact,
}) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { isModuleEnabled } = useWorkspaceModules();

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  const options: CreateOption[] = useMemo(() => {
    return UNIVERSAL_CREATE_CONFIG.map((cfg) => {
      let action: () => void;
      if (cfg.modalAction === "lead") {
        action = () => {
          onClose();
          onSelectLead();
        };
      } else if (cfg.modalAction === "deal") {
        action = () => {
          onClose();
          onSelectDeal();
        };
      } else if (cfg.modalAction === "contact") {
        action = () => {
          onClose();
          onSelectContact();
        };
      } else if (cfg.modalAction === "task") {
        action = () => {
          onClose();
          onSelectTask();
        };
      } else if (cfg.directRoute) {
        action = () => navigateTo(cfg.directRoute!);
      } else {
        action = () => onClose();
      }

      return {
        ...cfg,
        icon: OPTION_ICONS[cfg.id] || Plus,
        action,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, onSelectLead, onSelectDeal, onSelectTask, onSelectContact]);

  const enabledOptions = useMemo(() => {
    return options.filter((opt) => !opt.moduleKey || isModuleEnabled(opt.moduleKey));
  }, [options, isModuleEnabled]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return enabledOptions;
    const term = search.toLowerCase();
    return enabledOptions.filter(
      (opt) =>
        opt.title.toLowerCase().includes(term) ||
        opt.description.toLowerCase().includes(term) ||
        opt.category.toLowerCase().includes(term),
    );
  }, [enabledOptions, search]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-2xl p-0 overflow-hidden rounded-xl border border-[#E4E4E7] bg-white shadow-modal dark:border-[#303438] dark:bg-[#17191B]">
        <DialogHeader className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#303438]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EDF8F3] text-[#176B4D] dark:bg-[#15271F] dark:text-[#63B592]">
                <Plus className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Universal Create
              </DialogTitle>
            </div>
          </div>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              className="h-9 border border-[#E4E4E7] bg-[#FAFAFA] pl-9 text-xs dark:border-[#303438] dark:bg-[#1A1C1E]"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter actions (e.g. Lead, Deal, Order, Product, Task)..."
              value={search}
            />
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 niwa-scrollbar">
          {filteredOptions.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No creation action matches &ldquo;{search}&rdquo;.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {filteredOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={opt.action}
                    type="button"
                    className="group flex items-start gap-3 rounded-lg border border-[#E4E4E7] bg-white p-3.5 text-left transition-all hover:border-[#176B4D]/50 hover:bg-[#FAFCFB] hover:shadow-sm dark:border-[#282B2E] dark:bg-[#1C1F22] dark:hover:border-[#3B9B77]/60 dark:hover:bg-[#1F2424]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F4F4F5] text-[#52525B] transition-colors group-hover:bg-[#EDF8F3] group-hover:text-[#176B4D] dark:bg-[#25282B] dark:text-[#A7ABAF] dark:group-hover:bg-[#15271F] dark:group-hover:text-[#63B592]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground group-hover:text-[#176B4D] dark:group-hover:text-[#63B592]">
                          {opt.title}
                        </span>
                        <span className="rounded bg-[#F4F4F5] px-1.5 py-0.2 text-[9px] font-medium text-muted-foreground dark:bg-[#25282B]">
                          {opt.category}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-[#E4E4E7] bg-[#FAFAFA] px-4 py-2.5 text-[11px] text-muted-foreground dark:border-[#303438] dark:bg-[#191B1D]">
          Click any card to launch its creation dialog or workflow.
        </div>
      </DialogContent>
    </Dialog>
  );
};
