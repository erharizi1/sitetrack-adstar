import { requireRole } from "@/lib/auth";
import { labels } from "@/lib/labels";

export default async function EngineerDashboardPage() {
  await requireRole(["engineer", "owner"]);

  return (
    <div className="flex flex-col gap-2 px-5 py-8 sm:px-10">
      <h1 className="text-xl font-semibold">{labels.engineer.title}</h1>
      <p className="text-sm text-ink-muted">{labels.common.placeholder}</p>
    </div>
  );
}
