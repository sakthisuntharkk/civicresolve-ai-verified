import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { BarChart3, Building2, LayoutDashboard, Map as MapIcon, Plus, User } from "lucide-react";
import type { ReactNode } from "react";

const CITIZEN_LINKS = [
  { to: "/dashboard", label: "My Dashboard", icon: LayoutDashboard },
  { to: "/map", label: "Issue Map", icon: MapIcon },
] as const;

const AUTHORITY_LINKS = [
  { to: "/authority", label: "Operations", icon: Building2 },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuthority = pathname.startsWith("/authority") || pathname.startsWith("/analytics") || pathname.startsWith("/verification");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link to="/" aria-label="CivicAI home">
              <Logo />
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              <NavGroup label="Citizen" links={CITIZEN_LINKS} pathname={pathname} />
              <span className="mx-2 h-5 w-px bg-border" />
              <NavGroup label="Authority" links={AUTHORITY_LINKS} pathname={pathname} />
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider sm:inline-flex",
                isAuthority ? "border-ink bg-ink text-ink-foreground" : "border-primary/30 bg-primary/10 text-primary",
              )}
            >
              {isAuthority ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
              {isAuthority ? "Authority view" : "Citizen view"}
            </span>
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/report">
                <Plus className="h-4 w-4" /> Report issue
              </Link>
            </Button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t px-3 py-2 md:hidden">
          {[...CITIZEN_LINKS, ...AUTHORITY_LINKS].map((l) => (
            <NavLink key={l.to} to={l.to} label={l.label} icon={l.icon} active={pathname.startsWith(l.to)} />
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
      <footer className="mt-16 border-t py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <span>CivicAI · Not just closed. Actually resolved.</span>
          <span>Demo environment · Mock data for Chennai wards</span>
        </div>
      </footer>
    </div>
  );
}

function NavGroup({
  label,
  links,
  pathname,
}: {
  label: string;
  links: ReadonlyArray<{ to: string; label: string; icon: typeof LayoutDashboard }>;
  pathname: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">{label}</span>
      {links.map((l) => (
        <NavLink key={l.to} to={l.to} label={l.label} icon={l.icon} active={pathname.startsWith(l.to)} />
      ))}
    </div>
  );
}

function NavLink({ to, label, icon: Icon, active }: { to: string; label: string; icon: typeof LayoutDashboard; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
