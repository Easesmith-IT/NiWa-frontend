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
    ],
  },
  {
    label: "Products",
    moduleKey: "products",
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
    ],
  },
  {
    label: "Inventory",
    moduleKey: "inventory",
    items: [
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
    ],
  },
  {
    label: "Sales",
    moduleKey: "sales",
    items: [
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
        label: "Returns",
        description: "Customer returns, product restocking, and credit tracking.",
        moduleKey: "sales",
      },
    ],
  },

  {
    label: "CRM",
    items: [
      {
        href: "/people",
        icon: Users,
        label: "People",
        description: "Customer individuals, personal identities, and job titles.",
      },
      {
        href: "/contacts",
        icon: ContactRound,
        label: "Contacts",
        description: "Communication channels and WhatsApp endpoints.",
      },
      {
        href: "/companies",
        icon: Building2,
        label: "Companies",
        description: "B2B accounts, organizations, and industry details.",
      },
      {
        href: "/deals",
        icon: Briefcase,
        label: "Deals",
        description: "Sales opportunities, stages, and pipeline progress.",
      },
      {
        href: "/tasks",
        icon: ListTodo,
        label: "Tasks",
        description: "Follow-up execution and due work.",
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
    label: "Automate",
    items: [
      {
        href: "/ai-agent",
        icon: Sparkles,
        label: "AI Agent",
        description: "AI auto-reply settings, testing playground, and activity logs.",
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
    ],
  },
  {
    label: "Content",
    items: [
      {
        href: "/media",
        icon: ImagePlus,
        label: "Media",
        description: "Media library for reusable assets.",
      },
    ],
  },
  {
    label: "Developer",
    items: [
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
    ],
  },
  {
    label: "System",
    items: [
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
