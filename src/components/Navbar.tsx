"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sun,
  Moon,
  Monitor,
  Calendar,
  BarChart3,
  Rewind,
  Clock,
  Settings,
} from "lucide-react";

const themeOrder = ["system", "light", "dark"] as const;

const navLinks = [
  { href: "/dashboard", label: "Timeline", icon: Clock },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/stats", label: "Insights", icon: BarChart3 },
  { href: "/dashboard/review", label: "Review", icon: Rewind },
] as const;

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const cycleTheme = () => {
    const currentIndex = themeOrder.indexOf(theme as (typeof themeOrder)[number]);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <nav className="border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-xl font-bold">
              Memories
            </Link>
            {/* Desktop nav links */}
            <div className="hidden items-center gap-1 sm:flex">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive =
                  href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(href);
                return (
                  <Button
                    key={href}
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    asChild
                  >
                    <Link href={href}>
                      <Icon className="mr-1.5 h-3.5 w-3.5" />
                      {label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              asChild
            >
              <Link href="/dashboard/settings" aria-label="Settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={cycleTheme} aria-label="Toggle theme">
              <ThemeIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
        {/* Mobile nav links */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:hidden">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <Button
                key={href}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className="shrink-0"
                asChild
              >
                <Link href={href}>
                  <Icon className="mr-1 h-3.5 w-3.5" />
                  {label}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
