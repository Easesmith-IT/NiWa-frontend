import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare,
  Settings,
  LayoutDashboard,
  Webhook,
  LayoutTemplate,
  ImagePlus,
  MessagesSquare,
  ScrollText,
  FileJson,
} from "lucide-react";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/message-studio", label: "Message Studio", icon: MessageSquare },
  { href: "/conversations", label: "Conversations", icon: MessagesSquare },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/media", label: "Media Library", icon: ImagePlus },
  { href: "/logs/api", label: "API Logs", icon: ScrollText },
  { href: "/logs/webhooks", label: "Webhook Logs", icon: FileJson },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/webhooks", label: "Webhooks", icon: Webhook },
];

export const Sidebar = () => (
  <aside className="flex w-full max-w-72 flex-col rounded-[2rem] border border-white/50 bg-white/70 p-5 backdrop-blur">
    <div className="mb-8">
      <Image
        alt="NiWa logo"
        className="h-auto w-full max-w-[180px]"
        height={64}
        priority
        src="/niwa-logo.png"
        width={240}
      />
      <p className="mt-4 text-sm text-muted-foreground">Internal Console</p>
    </div>

    <nav className="space-y-2">
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  </aside>
);
