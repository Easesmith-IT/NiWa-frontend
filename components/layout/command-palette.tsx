"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Command,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useGlobalSearchQuery } from "../../features/search";
import { cn } from "../../lib/utils";
import { Input } from "../ui/input";
import { navigationGroups } from "./navigation";
import { useWorkspaceModules } from "../../lib/workspace/use-workspace-modules";

interface CommandPaletteProps {
  onClose: () => void;
  onOpenUniversalCreate?: () => void;
  open: boolean;
}

const primaryActions = [
  { href: "/inbox", label: "Open Inbox", keywords: ["conversation", "reply", "chat"] },
  { href: "/contacts", label: "Open Contacts", keywords: ["customer", "directory", "people"] },
  { href: "/crm/customer-360", label: "Customer 360", keywords: ["customer", "profile", "overview"] },
  { href: "/deals", label: "Open Deals Pipeline", keywords: ["sales", "pipeline", "deals", "opportunities"] },
  { href: "/leads", label: "Open Leads Management", keywords: ["prospects", "leads", "inbound"] },
  { href: "/products", label: "Product Catalog", keywords: ["inventory", "skus", "items", "goods"] },
  { href: "/sales/orders", label: "Sales Orders", keywords: ["orders", "sales", "invoicing"] },
  { href: "/purchasing/orders", label: "Purchase Orders", keywords: ["procurement", "suppliers", "po"] },
  { href: "/automations", label: "Create Automation", keywords: ["workflow", "automation"] },
  { href: "/scheduled", label: "Schedule Message", keywords: ["queue", "follow-up"] },
  { href: "/templates", label: "Open Templates", keywords: ["whatsapp", "meta"] },
  { href: "/settings", label: "Open Settings", keywords: ["configuration", "account"] },
];

export const CommandPalette = ({
  onClose,
  onOpenUniversalCreate,
  open,
}: CommandPaletteProps) => {
  const router = useRouter();
  const { isModuleEnabled } = useWorkspaceModules();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const searchQuery = useGlobalSearchQuery({ limit: 5, query });

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const quickCreateActions = useMemo(
    () => [
      {
        action: () => {
          onClose();
          onOpenUniversalCreate?.();
        },
        href: "#create",
        isSpecial: true,
        keywords: ["new", "create", "lead", "deal", "task", "contact", "order", "product"],
        label: "+ Create New Record…",
      },
      { href: "/products/new", label: "+ New Product", keywords: ["product", "sku", "create"] },
      { href: "/purchasing/orders/new", label: "+ New Purchase Order", keywords: ["po", "procurement", "create"] },
      { href: "/sales/quotes", label: "+ New Quotation", keywords: ["quote", "proposal", "estimate"] },
    ],
    [onClose, onOpenUniversalCreate],
  );

  const filteredActions = useMemo(() => {
    const source = [
      ...quickCreateActions,
      ...primaryActions,
      ...navigationGroups.flatMap((group) => group.items),
    ];
    if (!query.trim()) {
      return source.slice(0, 10);
    }

    const needle = query.toLowerCase();
    return source.filter((item) => {
      const haystack = [item.label, ...(item.keywords ?? []), item.href].join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [query, quickCreateActions]);

  const visibleConversations = searchQuery.data?.data.conversations ?? [];
  const visibleContacts = searchQuery.data?.data.contacts ?? [];
  const visibleNotes = searchQuery.data?.data.notes ?? [];
  const visibleMessages = searchQuery.data?.data.messages ?? [];

  const visibleProducts = isModuleEnabled("products")
    ? (searchQuery.data?.data.products ?? [])
    : [];
  const visibleSalesOrders = isModuleEnabled("sales")
    ? (searchQuery.data?.data.salesOrders ?? [])
    : [];
  const visiblePurchaseOrders = isModuleEnabled("purchasing")
    ? (searchQuery.data?.data.purchaseOrders ?? [])
    : [];
  const visibleDeals = isModuleEnabled("crm")
    ? (searchQuery.data?.data.deals ?? [])
    : [];
  const visibleLeads = isModuleEnabled("crm")
    ? (searchQuery.data?.data.leads ?? [])
    : [];

  const hasAnyResults =
    visibleConversations.length > 0 ||
    visibleContacts.length > 0 ||
    visibleNotes.length > 0 ||
    visibleMessages.length > 0 ||
    visibleProducts.length > 0 ||
    visibleSalesOrders.length > 0 ||
    visiblePurchaseOrders.length > 0 ||
    visibleDeals.length > 0 ||
    visibleLeads.length > 0;

  const goTo = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleActionClick = (action: (typeof filteredActions)[number]) => {
    if ("action" in action && typeof action.action === "function") {
      action.action();
    } else {
      goTo(action.href);
    }
  };

  const selectableCallbacks = useMemo(() => {
    const callbacks: Array<() => void> = [];
    for (const action of filteredActions) {
      callbacks.push(() => {
        if ("action" in action && typeof action.action === "function") {
          action.action();
        } else {
          router.push(action.href);
          onClose();
        }
      });
    }
    for (const item of visibleConversations) {
      callbacks.push(() => {
        router.push(`/inbox?conversationId=${encodeURIComponent(item.conversation._id)}`);
        onClose();
      });
    }
    for (const item of visibleContacts) {
      callbacks.push(() => {
        router.push(`/contacts?contactId=${encodeURIComponent(item.contact._id)}`);
        onClose();
      });
    }
    for (const item of visibleNotes) {
      callbacks.push(() => {
        if (item.conversation?._id) {
          router.push(`/inbox?conversationId=${encodeURIComponent(item.conversation._id)}`);
        } else if (item.contact?._id) {
          router.push(`/contacts?contactId=${encodeURIComponent(item.contact._id)}`);
        } else {
          router.push("/inbox");
        }
        onClose();
      });
    }
    for (const item of visibleMessages) {
      callbacks.push(() => {
        if (item.message.conversationId) {
          router.push(`/inbox?conversationId=${encodeURIComponent(String(item.message.conversationId))}`);
        } else if (item.contact?._id) {
          router.push(`/contacts?contactId=${encodeURIComponent(item.contact._id)}`);
        } else {
          router.push("/inbox");
        }
        onClose();
      });
    }
    for (const item of visibleProducts) {
      callbacks.push(() => {
        router.push(`/products/${encodeURIComponent(item._id)}`);
        onClose();
      });
    }
    for (const item of visibleSalesOrders) {
      callbacks.push(() => {
        router.push(`/sales/orders?orderId=${encodeURIComponent(item.orderId || item._id)}`);
        onClose();
      });
    }
    for (const item of visiblePurchaseOrders) {
      callbacks.push(() => {
        router.push(`/purchasing/orders/${encodeURIComponent(item._id)}`);
        onClose();
      });
    }
    for (const item of visibleDeals) {
      callbacks.push(() => {
        router.push(`/deals?dealId=${encodeURIComponent(item._id)}`);
        onClose();
      });
    }
    for (const item of visibleLeads) {
      callbacks.push(() => {
        router.push(`/leads?leadId=${encodeURIComponent(item._id)}`);
        onClose();
      });
    }
    return callbacks;
  }, [
    filteredActions,
    onClose,
    router,
    visibleContacts,
    visibleConversations,
    visibleDeals,
    visibleLeads,
    visibleMessages,
    visibleNotes,
    visibleProducts,
    visiblePurchaseOrders,
    visibleSalesOrders,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (selectableCallbacks.length === 0) {
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % selectableCallbacks.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) => (prev - 1 + selectableCallbacks.length) % selectableCallbacks.length);
      } else if (event.key === "Enter") {
        event.preventDefault();
        const target = selectableCallbacks[activeIndex] ?? selectableCallbacks[0];
        target?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, onClose, open, selectableCallbacks]);

  if (!open) {
    return null;
  }

  let runningIndex = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pb-6 pt-[10vh] backdrop-blur-xs">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-[#E4E4E7] bg-white shadow-modal dark:border-[#303438] dark:bg-[#17191B]">
        <div className="border-b border-[#E4E4E7] px-4 py-3 dark:border-[#303438]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              className="h-10 border-0 bg-transparent pl-10 text-sm shadow-none focus:border-0 focus:ring-0"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search contacts, conversations, notes, products, orders, deals, or jump to a page..."
              value={query}
            />
          </div>
        </div>

        <div className="grid max-h-[65vh] gap-0 overflow-hidden md:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-[#E4E4E7] dark:border-[#303438] md:border-b-0 md:border-r">
            <div className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Actions & Navigation
            </div>
            <div className="niwa-scrollbar max-h-[50vh] overflow-y-auto px-2 pb-2">
              {filteredActions.map((action) => {
                const itemIndex = runningIndex++;
                const isActive = itemIndex === activeIndex;
                return (
                  <button
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors hover:bg-[#F4F4F5] focus:bg-[#F4F4F5] focus:outline-none dark:hover:bg-[#202326] dark:focus:bg-[#202326]",
                      "isSpecial" in action && action.isSpecial
                        ? "text-[#176B4D] font-semibold hover:bg-[#EDF8F3] dark:text-[#63B592] dark:hover:bg-[#15271F]"
                        : "text-foreground",
                      isActive && "bg-[#F4F4F5] dark:bg-[#202326] ring-1 ring-[#176B4D]/30",
                    )}
                    key={`${action.href}-${action.label}`}
                    onClick={() => handleActionClick(action)}
                    onMouseEnter={() => setActiveIndex(itemIndex)}
                    type="button"
                  >
                    <span>{action.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Search Records
            </div>
            <div className="niwa-scrollbar max-h-[50vh] overflow-y-auto px-2 pb-2">
              {!query.trim() ? (
                <div className="px-3 py-6 text-xs text-muted-foreground">
                  Use <kbd className="rounded border border-[#E4E4E7] bg-[#FAFAFA] px-1 py-0.5 font-medium text-foreground dark:border-[#303438] dark:bg-[#1B1D20]">↑</kbd> <kbd className="rounded border border-[#E4E4E7] bg-[#FAFAFA] px-1 py-0.5 font-medium text-foreground dark:border-[#303438] dark:bg-[#1B1D20]">↓</kbd> and <kbd className="rounded border border-[#E4E4E7] bg-[#FAFAFA] px-1 py-0.5 font-medium text-foreground dark:border-[#303438] dark:bg-[#1B1D20]">Enter</kbd> to jump between modules or search across all records.
                </div>
              ) : null}

              {visibleConversations.map((item) => {
                const itemIndex = runningIndex++;
                const isActive = itemIndex === activeIndex;
                return (
                  <button
                    className={cn(
                      "block w-full rounded-md px-2.5 py-2.5 text-left transition-colors hover:bg-[#F4F4F5] dark:hover:bg-[#202326]",
                      isActive && "bg-[#F4F4F5] dark:bg-[#202326] ring-1 ring-[#176B4D]/30",
                    )}
                    key={item.conversation._id}
                    onClick={() => goTo(`/inbox?conversationId=${encodeURIComponent(item.conversation._id)}`)}
                    onMouseEnter={() => setActiveIndex(itemIndex)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-foreground">
                        {item.contact?.displayName || item.contact?.phoneNumber || item.conversation.waId}
                      </p>
                      <span className="text-[11px] text-muted-foreground">Conversation</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.conversation.lastMessageText || "No recent message"}
                    </p>
                  </button>
                );
              })}

              {visibleContacts.map((item) => {
                const itemIndex = runningIndex++;
                const isActive = itemIndex === activeIndex;
                return (
                  <button
                    className={cn(
                      "block w-full rounded-md px-2.5 py-2.5 text-left transition-colors hover:bg-[#F4F4F5] dark:hover:bg-[#202326]",
                      isActive && "bg-[#F4F4F5] dark:bg-[#202326] ring-1 ring-[#176B4D]/30",
                    )}
                    key={item.contact._id}
                    onClick={() => goTo(`/contacts?contactId=${encodeURIComponent(item.contact._id)}`)}
                    onMouseEnter={() => setActiveIndex(itemIndex)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-foreground">{item.contact.displayName}</p>
                      <span className="text-[11px] text-muted-foreground">Contact</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.contact.phoneNumber}
                      {item.contact.company ? ` • ${item.contact.company}` : ""}
                    </p>
                  </button>
                );
              })}

              {visibleNotes.map((item) => {
                const itemIndex = runningIndex++;
                const isActive = itemIndex === activeIndex;
                return (
                  <button
                    className={cn(
                      "block w-full rounded-md px-2.5 py-2.5 text-left transition-colors hover:bg-[#F4F4F5] dark:hover:bg-[#202326]",
                      isActive && "bg-[#F4F4F5] dark:bg-[#202326] ring-1 ring-[#176B4D]/30",
                    )}
                    key={item.note._id}
                    onClick={() => {
                      if (item.conversation?._id) {
                        goTo(`/inbox?conversationId=${encodeURIComponent(item.conversation._id)}`);
                      } else if (item.contact?._id) {
                        goTo(`/contacts?contactId=${encodeURIComponent(item.contact._id)}`);
                      } else {
                        goTo("/inbox");
                      }
                    }}
                    onMouseEnter={() => setActiveIndex(itemIndex)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-foreground">
                        {item.contact?.displayName || "Note"}
                      </p>
                      <span className="text-[11px] text-muted-foreground">Note</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.note.content}
                    </p>
                  </button>
                );
              })}

              {visibleMessages.map((item) => {
                const itemIndex = runningIndex++;
                const isActive = itemIndex === activeIndex;
                return (
                  <button
                    className={cn(
                      "block w-full rounded-md px-2.5 py-2.5 text-left transition-colors hover:bg-[#F4F4F5] dark:hover:bg-[#202326]",
                      isActive && "bg-[#F4F4F5] dark:bg-[#202326] ring-1 ring-[#176B4D]/30",
                    )}
                    key={item.message._id}
                    onClick={() => {
                      if (item.message.conversationId) {
                        goTo(`/inbox?conversationId=${encodeURIComponent(String(item.message.conversationId))}`);
                      } else if (item.contact?._id) {
                        goTo(`/contacts?contactId=${encodeURIComponent(item.contact._id)}`);
                      } else {
                        goTo("/inbox");
                      }
                    }}
                    onMouseEnter={() => setActiveIndex(itemIndex)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-foreground">
                        {item.contact?.displayName || item.message.from || "Message"}
                      </p>
                      <span className="text-[11px] text-muted-foreground">Message</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.message.previewText || "Message text"}
                    </p>
                  </button>
                );
              })}

              {visibleProducts.map((item) => {
                const itemIndex = runningIndex++;
                const isActive = itemIndex === activeIndex;
                return (
                  <button
                    className={cn(
                      "block w-full rounded-md px-2.5 py-2.5 text-left transition-colors hover:bg-[#F4F4F5] dark:hover:bg-[#202326]",
                      isActive && "bg-[#F4F4F5] dark:bg-[#202326] ring-1 ring-[#176B4D]/30",
                    )}
                    key={item._id}
                    onClick={() => goTo(`/products/${encodeURIComponent(item._id)}`)}
                    onMouseEnter={() => setActiveIndex(itemIndex)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span>{item.name}</span>
                      </p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">Product</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      SKU: {item.productId} • {item.status}
                    </p>
                  </button>
                );
              })}

              {visibleSalesOrders.map((item) => {
                const itemIndex = runningIndex++;
                const isActive = itemIndex === activeIndex;
                return (
                  <button
                    className={cn(
                      "block w-full rounded-md px-2.5 py-2.5 text-left transition-colors hover:bg-[#F4F4F5] dark:hover:bg-[#202326]",
                      isActive && "bg-[#F4F4F5] dark:bg-[#202326] ring-1 ring-[#176B4D]/30",
                    )}
                    key={item._id}
                    onClick={() => goTo(`/sales/orders?orderId=${encodeURIComponent(item.orderId || item._id)}`)}
                    onMouseEnter={() => setActiveIndex(itemIndex)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <ShoppingBag className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span>Order #{item.orderId}</span>
                      </p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">Sales Order</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.customerName || "Customer"} • {item.status}
                      {item.total != null ? ` • $${item.total.toLocaleString()}` : ""}
                    </p>
                  </button>
                );
              })}

              {visiblePurchaseOrders.map((item) => {
                const itemIndex = runningIndex++;
                const isActive = itemIndex === activeIndex;
                return (
                  <button
                    className={cn(
                      "block w-full rounded-md px-2.5 py-2.5 text-left transition-colors hover:bg-[#F4F4F5] dark:hover:bg-[#202326]",
                      isActive && "bg-[#F4F4F5] dark:bg-[#202326] ring-1 ring-[#176B4D]/30",
                    )}
                    key={item._id}
                    onClick={() => goTo(`/purchasing/orders/${encodeURIComponent(item._id)}`)}
                    onMouseEnter={() => setActiveIndex(itemIndex)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <ShoppingCart className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span>PO #{item.orderId}</span>
                      </p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">Purchase Order</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.supplierName || "Supplier"} • {item.status}
                      {item.total != null ? ` • $${item.total.toLocaleString()}` : ""}
                    </p>
                  </button>
                );
              })}

              {visibleDeals.map((item) => {
                const itemIndex = runningIndex++;
                const isActive = itemIndex === activeIndex;
                return (
                  <button
                    className={cn(
                      "block w-full rounded-md px-2.5 py-2.5 text-left transition-colors hover:bg-[#F4F4F5] dark:hover:bg-[#202326]",
                      isActive && "bg-[#F4F4F5] dark:bg-[#202326] ring-1 ring-[#176B4D]/30",
                    )}
                    key={item._id}
                    onClick={() => goTo(`/deals?dealId=${encodeURIComponent(item._id)}`)}
                    onMouseEnter={() => setActiveIndex(itemIndex)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Briefcase className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span>{item.title}</span>
                      </p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">Deal</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.status}
                      {item.value != null ? ` • ${item.currency || "$"}${item.value.toLocaleString()}` : ""}
                    </p>
                  </button>
                );
              })}

              {visibleLeads.map((item) => {
                const itemIndex = runningIndex++;
                const isActive = itemIndex === activeIndex;
                return (
                  <button
                    className={cn(
                      "block w-full rounded-md px-2.5 py-2.5 text-left transition-colors hover:bg-[#F4F4F5] dark:hover:bg-[#202326]",
                      isActive && "bg-[#F4F4F5] dark:bg-[#202326] ring-1 ring-[#176B4D]/30",
                    )}
                    key={item._id}
                    onClick={() => goTo(`/leads?leadId=${encodeURIComponent(item._id)}`)}
                    onMouseEnter={() => setActiveIndex(itemIndex)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Target className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span>{item.title}</span>
                      </p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">Lead</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.status}
                      {item.leadSource ? ` • Source: ${item.leadSource}` : ""}
                      {item.value != null ? ` • $${item.value.toLocaleString()}` : ""}
                    </p>
                  </button>
                );
              })}

              {query.trim() && !searchQuery.isPending && searchQuery.data && !hasAnyResults ? (
                <div className="px-3 py-6 text-xs text-muted-foreground">
                  No records matched this search.
                </div>
              ) : null}

              {searchQuery.isPending ? (
                <div className="px-3 py-6 text-xs text-muted-foreground">Searching…</div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#E4E4E7] bg-[#FAFAFA] px-4 py-2 text-[11px] text-muted-foreground dark:border-[#303438] dark:bg-[#1B1D20]">
          <span className="inline-flex items-center gap-1.5">
            <Command className="h-3 w-3" />
            Navigate with ↑↓ • Select with Enter
          </span>
          <button className="font-medium text-foreground hover:underline" onClick={onClose} type="button">
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};

