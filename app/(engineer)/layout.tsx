import Link from "next/link";
import { signOut } from "@/actions/auth";
import { Brand } from "@/components/Brand";
import { requireRole } from "@/lib/auth";
import { labels } from "@/lib/labels";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * The engineer's (and, for now, the owner's) desktop shell — the header from
 * docs/design/final-designs/invite/TeamPanel.dc.html. Each page still checks
 * the role itself; a layout alone isn't a safe place for access checks.
 */
export default async function EngineerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(["engineer", "owner"]);
  const role = labels.roles[profile.role as keyof typeof labels.roles];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-16 items-center justify-between gap-4 border-b border-line bg-surface px-5 sm:px-10">
        <div className="flex items-center gap-7">
          <Brand size="sm" />
          <nav className="flex gap-1">
            <Link
              href="/dashboard"
              className="rounded-lg bg-steel-soft px-3 py-2 text-sm font-semibold text-steel"
            >
              {labels.engineer.navDashboard}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-[13.5px] font-semibold">{profile.name}</span>
            <span className="text-xs text-ink-muted">{role}</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-[13px] font-semibold text-white">
            {initials(profile.name)}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="min-h-11 px-2 text-sm font-semibold text-ink-muted"
            >
              {labels.common.logout}
            </button>
          </form>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
