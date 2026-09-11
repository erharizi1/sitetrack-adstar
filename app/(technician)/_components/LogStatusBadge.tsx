import { labels } from "@/lib/labels";

const STYLES: Record<string, string> = {
  draft: "bg-line text-ink-muted",
  submitted: "bg-steel-soft text-steel",
  approved: "bg-good-soft text-good",
  rejected: "bg-red-100 text-red-700",
};

export function LogStatusBadge({ status }: { status: string }) {
  const text =
    labels.technician.status[status as keyof typeof labels.technician.status] ??
    status;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        STYLES[status] ?? STYLES.draft
      }`}
    >
      {text}
    </span>
  );
}
