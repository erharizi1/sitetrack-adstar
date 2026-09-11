"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { labels } from "@/lib/labels";

const LINKS = [
  { href: "/dashboard", label: labels.engineer.navDashboard },
  { href: "/team", label: labels.engineer.navTeam },
];

/** "Paneli · Ekipi" — the current page highlighted, as in the design. */
export function EngineerNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm ${
              active ? "bg-steel-soft font-semibold text-steel" : "text-ink-muted"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
