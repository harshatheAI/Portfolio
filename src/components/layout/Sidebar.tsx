"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Sparkles,
  LayoutDashboard,
  Briefcase,
  FileText,
  UserCircle,
  Settings,
  LogOut,
  BriefcaseBusiness,
  Users,
  Building2,
  TrendingUp,
  PlusCircle,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const candidateNav: NavItem[] = [
  { href: "/candidate/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/candidate/jobs", label: "Discover Jobs", icon: <Briefcase className="w-4 h-4" /> },
  { href: "/candidate/applications", label: "Applications", icon: <FileText className="w-4 h-4" /> },
  { href: "/candidate/profile", label: "My Profile", icon: <UserCircle className="w-4 h-4" /> },
];

const recruiterNav: NavItem[] = [
  { href: "/recruiter/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/recruiter/jobs", label: "Jobs", icon: <BriefcaseBusiness className="w-4 h-4" /> },
  { href: "/recruiter/jobs/new", label: "Post a Job", icon: <PlusCircle className="w-4 h-4" /> },
  { href: "/recruiter/candidates", label: "Candidates", icon: <Users className="w-4 h-4" /> },
];

const agencyNav: NavItem[] = [
  { href: "/agency/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/agency/clients", label: "Clients", icon: <Building2 className="w-4 h-4" /> },
  { href: "/agency/candidates", label: "Talent Pool", icon: <Users className="w-4 h-4" /> },
  { href: "/agency/placements", label: "Placements", icon: <TrendingUp className="w-4 h-4" /> },
  { href: "/agency/analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
];

type SidebarVariant = "candidate" | "recruiter" | "agency";

interface SidebarProps {
  variant: SidebarVariant;
  userName?: string | null;
  userEmail?: string | null;
}

const navMap: Record<SidebarVariant, NavItem[]> = {
  candidate: candidateNav,
  recruiter: recruiterNav,
  agency: agencyNav,
};

const variantColors: Record<SidebarVariant, string> = {
  candidate: "#4361ee",
  recruiter: "#7b5ea7",
  agency: "#22c55e",
};

export function Sidebar({ variant, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const navItems = navMap[variant];
  const color = variantColors[variant];

  return (
    <aside className="w-60 flex-shrink-0 h-screen sticky top-0 flex flex-col border-r border-white/5 bg-[#0a0a0f]">
      {/* Logo */}
      <div className="p-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${color}, #7b5ea7)` }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white text-sm">NexusHire</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/candidate/dashboard" && item.href !== "/recruiter/dashboard" && item.href !== "/agency/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-white/8 text-white font-medium"
                  : "text-white/50 hover:text-white hover:bg-white/4"
              )}
            >
              <span className={isActive ? "text-white" : "text-white/40"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/5 space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/4 transition-all"
        >
          <Settings className="w-4 h-4 text-white/40" />
          Settings
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/4 transition-all w-full"
        >
          <LogOut className="w-4 h-4 text-white/40" />
          Sign out
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2 mt-2 rounded-lg bg-white/3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${color}, #7b5ea7)` }}
          >
            {userName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-white truncate">{userName || "User"}</div>
            <div className="text-xs text-white/30 truncate">{userEmail}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
