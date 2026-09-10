import { labels } from "@/lib/labels";

export default function PmDashboardPage() {
  return (
    <main className="flex min-h-dvh flex-col gap-2 p-8">
      <h1 className="text-xl font-semibold">{labels.pm.title}</h1>
      <p className="text-sm text-ink-muted">{labels.common.placeholder}</p>
    </main>
  );
}
