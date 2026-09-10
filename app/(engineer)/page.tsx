import { labels } from "@/lib/labels";

export default function EngineerPage() {
  return (
    <main className="flex min-h-dvh flex-col gap-2 p-5">
      <h1 className="text-base font-semibold">{labels.engineer.title}</h1>
      <p className="text-sm text-ink-muted">{labels.common.placeholder}</p>
    </main>
  );
}
