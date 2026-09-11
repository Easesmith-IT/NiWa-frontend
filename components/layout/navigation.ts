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
  GitFork,
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
    label: "CRM",
    items: [
      {
        href: "/contacts",
        icon: ContactRound,
        label: "Contacts",
        description: "Customer directory, import, and labels.",
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
