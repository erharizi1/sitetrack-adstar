import { sendLoginLink } from "@/actions/auth";
import { Brand } from "@/components/Brand";
import { SubmitButton } from "@/components/SubmitButton";
import { labels } from "@/lib/labels";

/** Expired link — docs/design/final-designs/login/LinkExpired.dc.html */
export default function LinkExpiredPage() {
  return (
    <>
      <Brand />

      <div className="flex flex-col gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-[26px] font-bold tracking-tight">
            {labels.login.expiredTitle}
          </h1>
          <p className="text-[15px] leading-normal text-ink-muted">
            {labels.login.expiredBody}
          </p>
        </div>
      </div>

      <form action={sendLoginLink} className="flex flex-col gap-4">
        <label className="flex flex-col gap-[7px]">
          <span className="text-[13px] font-semibold">{labels.login.email}</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder={labels.login.emailPlaceholder}
            className="min-h-[52px] rounded-xl border border-line bg-surface px-4 text-[15px] outline-none focus:border-2 focus:border-accent"
          />
        </label>
        <SubmitButton pendingLabel={labels.login.sending}>
          {labels.login.sendNew}
        </SubmitButton>
      </form>
    </>
  );
}
