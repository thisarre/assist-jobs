import {
  LayoutDashboard,
  Briefcase,
  Building2,
  Users,
  Sparkles,
  Settings,
} from "lucide-react";
import { SidebarNavItem } from "./sidebar-nav-item";

const navItems = [
  { href: "/", icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard" },
  { href: "/opportunities", icon: <Briefcase className="h-4 w-4" />, label: "Opportunities" },
  { href: "/companies", icon: <Building2 className="h-4 w-4" />, label: "Companies" },
  { href: "/contacts", icon: <Users className="h-4 w-4" />, label: "Contacts" },
  { href: "/analyze", icon: <Sparkles className="h-4 w-4" />, label: "AI Analyzer" },
];

const bottomItems = [
  { href: "/settings", icon: <Settings className="h-4 w-4" />, label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border bg-background">
      <div className="flex h-14 items-center border-b border-border px-4">
        <span className="text-sm font-semibold tracking-tight">Freelance OS</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => (
          <SidebarNavItem key={item.href} {...item} />
        ))}
      </nav>
      <div className="border-t border-border p-3">
        {bottomItems.map((item) => (
          <SidebarNavItem key={item.href} {...item} />
        ))}
      </div>
    </aside>
  );
}
