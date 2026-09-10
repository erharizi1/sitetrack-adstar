import { labels } from "@/lib/labels";

/** The SiteTrack mark and name, as on every screen in the designs. */
export function Brand({ size = "md" }: { size?: "sm" | "md" }) {
  const small = size === "sm";

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex items-center justify-center bg-accent ${
          small ? "h-8 w-8 rounded-[10px]" : "h-10 w-10 rounded-xl"
        }`}
      >
        <svg
          width={small ? 16 : 20}
          height={small ? 16 : 20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 21h18" />
          <path d="M5 21V7l7-4 7 4v14" />
          <path d="M9 21v-6h6v6" />
        </svg>
      </div>
      <span className={`font-bold ${small ? "text-[15px]" : "text-[17px]"}`}>
        {labels.app.name}
      </span>
    </div>
  );
}
