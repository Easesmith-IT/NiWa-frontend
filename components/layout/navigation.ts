import {
  BellRing,
  Bot,
  CalendarClock,
  ContactRound,
  FileJson,
  ImagePlus,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  MessageSquare,
  ScrollText,
  Settings,
  Slash,
  Sparkles,
  ListTodo,
  Webhook,
  Megaphone,
  Briefcase,
  Building2,
  GitFork,
  Package,
  Tag,
  Layers,
  Truck,
  Boxes,
  MapPin,
  History,
  ShoppingBag,
  FileText,
  CreditCard,
  RotateCcw,
  Users,
  ShoppingCart,
  Landmark,
  Receipt,
  Scale,
  BookOpen,
  TrendingUp,
  Wallet,
  FileSpreadsheet,
  Percent,
  Target,
  UserCheck,
  PhoneCall,
} from "lucide-react";


export interface NavigationItem {
  href: string;
  icon: typeof Inbox;
  label: string;
  shortLabel?: string;
  keywords?: string[];
  description: string;
  moduleKey?: string;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
  moduleKey?: string;
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        href: "/",
        icon: LayoutDashboard,
        label: "Dashboard",
        description: "Operational overview and attention queues.",
      },
      {
        href: "/inbox",
        icon: Inbox,
        label: "Inbox",
        description: "Live conversations, context, and messaging actions.",
      },
      {
        href: "/tasks",
        icon: ListTodo,
        label: "Tasks",
        description: "Follow-up execution and due work.",
      },
    ],
  },
  {
    label: "CRM & Customers",
    items: [
      {
        href: "/crm/customer-360",
        icon: UserCheck,
        label: "Customer 360",
        description: "Unified customer identity, communication, and deal history.",
      },
      {
        href: "/contacts",
        icon: ContactRound,
        label: "Contacts",
        description: "Communication channels and WhatsApp endpoints.",
      },
      {
        href: "/people",
        icon: Users,
        label: "People",
        description: "Customer individuals, personal identities, and job titles.",
      },
      {
        href: "/companies",
        icon: Building2,
        label: "Companies",
        description: "B2B accounts, organizations, and industry details.",
      },
      {
        href: "/leads",
        icon: Target,
        label: "Leads",
        description: "Inbound prospects, qualification, and deal conversions.",
      },
      {
        href: "/deals",
        icon: Briefcase,
        label: "Deals",
        description: "Sales opportunities, stages, and pipeline progress.",
      },
      {
        href: "/pipelines",
        icon: GitFork,
        label: "Pipelines",
        description: "Configure deal pipelines and stage workflows.",
      },
    ],
  },
  {
    label: "Sales",
    moduleKey: "sales",
    items: [
      {
        href: "/sales/quotes",
        icon: FileText,
        label: "Quotes",
        description: "Customer price quotations, proposals, and orders conversion.",
        moduleKey: "sales",
      },
      {
        href: "/sales/orders",
        icon: ShoppingBag,
        label: "Sales Orders",
        description: "Commercial orders, status tracking, and inventory fulfillment.",
        moduleKey: "sales",
      },
      {
        href: "/sales/invoices",
        icon: FileText,
        label: "Invoices",
        description: "Billing documents, balance tracking, and financial records.",
        moduleKey: "sales",
      },
      {
        href: "/sales/payments",
        icon: CreditCard,
        label: "Payments",
        description: "Payment collection, receipt records, and invoice settlements.",
        moduleKey: "sales",
      },
      {
        href: "/sales/returns",
        icon: RotateCcw,
        label: "Sales Returns",
        description: "Customer returns, product restocking, and credit tracking.",
        moduleKey: "sales",
      },
    ],
  },
  {
    label: "Catalog & Stock",
    items: [
      {
        href: "/products",
        icon: Package,
        label: "Products",
        description: "Product catalog, variants, and pricing.",
        moduleKey: "products",
      },
      {
        href: "/products/categories",
        icon: Layers,
        label: "Categories",
        description: "Hierarchical product category tree.",
        moduleKey: "products",
      },
      {
        href: "/products/brands",
        icon: Tag,
        label: "Brands",
        description: "Product brand registry.",
        moduleKey: "products",
      },
      {
        href: "/products/suppliers",
        icon: Truck,
        label: "Suppliers",
        description: "Supplier contacts and variant links.",
        moduleKey: "products",
      },
      {
        href: "/inventory",
        icon: Boxes,
        label: "Stock",
        description: "Stock levels, on-hand counts, and availability.",
        moduleKey: "inventory",
      },
      {
        href: "/inventory/locations",
        icon: MapPin,
        label: "Locations",
        description: "Warehouses, stores, and stock locations.",
        moduleKey: "inventory",
      },
      {
        href: "/inventory/movements",
        icon: History,
        label: "Movements",
        description: "Stock movement ledger and audit history.",
        moduleKey: "inventory",
      },
      {
        href: "/purchasing/orders",
        icon: ShoppingCart,
        label: "Purchase Orders",
        description: "Replenish stock, supplier orders, and receiving.",
        moduleKey: "purchasing",
      },
      {
        href: "/purchasing/returns",
        icon: RotateCcw,
        label: "Purchase Returns",
        description: "Supplier returns, debit notes, and stock deduction.",
        moduleKey: "purchasing",
      },
    ],
  },
  {
    label: "Finance",
    moduleKey: "finance",
    items: [
      {
        href: "/finance",
        icon: Landmark,
        label: "Overview",
        description: "Financial overview, KPIs, and quick actions.",
        moduleKey: "finance",
      },
      {
        href: "/finance/receivables",
        icon: Wallet,
        label: "Receivables",
        description: "AR aging, customer balances, and ledger reconciliation.",
        moduleKey: "finance",
      },
      {
        href: "/finance/payables",
        icon: CreditCard,
        label: "Payables",
        description: "Supplier bills, payments, AP aging, and reconciliation.",
        moduleKey: "finance",
      },
      {
        href: "/finance/expenses",
        icon: Receipt,
        label: "Expenses",
        description: "Operating expenses, bills, and payment records.",
        moduleKey: "finance",
      },
      {
        href: "/finance/income",
        icon: TrendingUp,
        label: "Other Income",
        description: "Non-sales revenues and misc income tracking.",
        moduleKey: "finance",
      },
      {
        href: "/finance/journals",
        icon: BookOpen,
        label: "Journals",
        description: "Double-entry general journals and manual adjusting entries.",
        moduleKey: "finance",
      },
      {
        href: "/finance/accounts",
        icon: Layers,
        label: "Chart of Accounts",
        description: "Chart of Accounts hierarchy, balances, and ledger activity.",
        moduleKey: "finance",
      },
      {
        href: "/finance/reports",
        icon: FileSpreadsheet,
        label: "Reports",
        description: "Trial Balance, P&L, Balance Sheet, Cash Flow, and Tax Summary.",
        moduleKey: "finance",
      },
      {
        href: "/finance/reconciliation",
        icon: Scale,
        label: "Reconciliation",
        description: "AR, AP, and Bank statement reconciliation.",
        moduleKey: "finance",
      },
      {
        href: "/finance/taxes",
        icon: Percent,
        label: "Tax Codes",
        description: "Tax rates, GST codes, and default account mappings.",
        moduleKey: "finance",
      },
      {
        href: "/finance/settings",
        icon: Settings,
        label: "Settings",
        description: "Activation date, period locks, and opening balances.",
        moduleKey: "finance",
      },
    ],
  },
  {
    label: "Automate & System",
    items: [
      {
        href: "/ai-agent",
        icon: Sparkles,
        label: "AI Agent",
        description: "AI auto-reply settings, testing playground, and activity logs.",
      },
      {
        href: "/ai-calling",
        icon: PhoneCall,
        label: "AI Calling",
        description: "AI voice call sessions, recordings, transcripts, and handoffs.",
        moduleKey: "ai_calling",
      },
      {
        href: "/automations",
        icon: Bot,
        label: "Automations",
        description: "Automation registry and builders.",
      },
      {
        href: "/campaigns",
        icon: Megaphone,
        label: "Campaigns",
        description: "Bulk messaging operations.",
      },
      {
        href: "/scheduled",
        icon: CalendarClock,
        label: "Scheduled",
        description: "Queued, upcoming, and failed scheduled messages.",
      },
      {
        href: "/templates",
        icon: LayoutTemplate,
        label: "Templates",
        description: "Synced WhatsApp message templates.",
      },
      {
        href: "/quick-replies",
        icon: Slash,
        label: "Quick Replies",
        description: "Reusable shortcut replies and variables.",
      },
      {
        href: "/media",
        icon: ImagePlus,
        label: "Media",
        description: "Media library for reusable assets.",
      },
      {
        href: "/message-studio",
        icon: MessageSquare,
        label: "Message Studio",
        description: "Developer-oriented message payload testing.",
      },
      {
        href: "/webhooks",
        icon: Webhook,
        label: "Webhooks",
        description: "Webhook status and event processing.",
      },
      {
        href: "/logs/api",
        icon: ScrollText,
        label: "API Logs",
        description: "Outbound and backend API request logs.",
      },
      {
        href: "/logs/webhooks",
        icon: FileJson,
        label: "Webhook Logs",
        description: "Inbound webhook payload and processing logs.",
      },
      {
        href: "/usage",
        icon: Receipt,
        label: "WhatsApp Usage",
        description: "WhatsApp message pricing, allowance, and financial ledger.",
      },
      {
        href: "/settings",
        icon: Settings,
        label: "Settings",
        description: "Workspace, messaging, and integration settings.",
      },
    ],
  },
];

export const secondaryActions = [
  {
    href: "/search",
    icon: BellRing,
    label: "Search",
    description: "Cross-record search and discovery.",
  },
];

export const routeMeta = new Map(
  [...navigationGroups.flatMap((group) => group.items), ...secondaryActions].map((item) => [
    item.href,
    item,
  ]),
);

export interface RouteBreadcrumb {
  groupLabel: string;
  item: NavigationItem;
  isDetailSubpage: boolean;
}

/**
 * Resolves the most specific matching navigation group and item for a pathname
 * so the Topbar can render concise clickable breadcrumbs.
 */
export function getRouteBreadcrumb(pathname: string): RouteBreadcrumb {
  let bestGroup = navigationGroups[0];
  let bestItem = navigationGroups[0].items[0];
  let bestMatchLen = -1;

  for (const group of navigationGroups) {
    for (const item of group.items) {
      const matches =
        item.href === "/"
          ? pathname === "/"
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (matches && item.href.length > bestMatchLen) {
        bestGroup = group;
        bestItem = item;
        bestMatchLen = item.href.length;
      }
    }
  }

  for (const sec of secondaryActions) {
    const matches = pathname === sec.href || pathname.startsWith(`${sec.href}/`);
    if (matches && sec.href.length > bestMatchLen) {
      bestGroup = { label: "Workspace", items: secondaryActions };
      bestItem = sec;
      bestMatchLen = sec.href.length;
    }
  }

  const isDetailSubpage = bestItem.href !== "/" && pathname !== bestItem.href && pathname.startsWith(`${bestItem.href}/`);
  return {
    groupLabel: bestGroup.label,
    item: bestItem,
    isDetailSubpage,
  };
}

/**
 * Filters navigation groups and items based on the active workspace's enabled modules.
 * - Items/groups without moduleKey are core and always included.
 * - Items/groups with moduleKey are included only if moduleKey is in enabledModuleKeys.
 * - Groups with no remaining items are omitted.
 */
export function filterNavigationByModules(
  groups: NavigationGroup[],
  enabledModuleKeys: string[]
): NavigationGroup[] {
  const enabledSet = new Set(enabledModuleKeys.map((k) => k.toLowerCase()));

  return groups
    .filter((group) => {
      if (group.moduleKey && !enabledSet.has(group.moduleKey.toLowerCase())) {
        return false;
      }
      return true;
    })
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.moduleKey && !enabledSet.has(item.moduleKey.toLowerCase())) {
          return false;
        }
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);
}
