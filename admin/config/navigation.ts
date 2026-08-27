import {
  Activity,
  BarChart,
  Building2,
  CreditCard,
  LayoutDashboard,
  Plug,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

export interface AdminNavigationItem {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  description: string;
}

export interface AdminNavigationGroup {
  label: string;
  items: AdminNavigationItem[];
}

export const adminNavigationGroups: AdminNavigationGroup[] = [
  {
    label: "Platform",
    items: [
      {
        href: "/admin",
        icon: LayoutDashboard,
        label: "Dashboard",
        description: "Platform overview and metrics.",
      },
      {
        href: "/admin/tenants",
        icon: Building2,
        label: "Tenants",
        description: "Manage workspaces and accounts.",
      },
      {
        href: "/admin/users",
        icon: Users,
        label: "Users",
        description: "Platform user management.",
      },
    ],
  },
  {
    label: "Monitoring",
    items: [
      {
        href: "/admin/subscriptions",
        icon: CreditCard,
        label: "Subscriptions",
        description: "Platform-level billing visibility.",
      },
      {
        href: "/admin/usage",
        icon: BarChart,
        label: "Usage",
        description: "Platform usage reporting.",
      },
      {
        href: "/admin/audit",
        icon: ShieldCheck,
        label: "Audit Logs",
        description: "System-wide audit trail.",
      },
    ],
  },
  {
    label: "Configuration",
    items: [
      {
        href: "/admin/integrations",
        icon: Plug,
        label: "Integrations",
        description: "Platform-level integrations.",
      },
      {
        href: "/admin/system",
        icon: Settings,
        label: "System",
        description: "Platform operations and status.",
      },
    ],
  },
];
