import Link from "next/link";
import { redirect } from "next/navigation";
import { sendLoginLink } from "@/actions/auth";
import { Brand } from "@/components/Brand";
import { SubmitButton } from "@/components/SubmitButton";
import { labels } from "@/lib/labels";

/** Check your email — docs/design/final-designs/login/CheckEmail.dc.html */
export default async function CheckEmailPage({
  searchParams,
}: PageProps<"/login/check">) {
  const { email, wait } = await searchParams;
  if (typeof email !== "string" || !email) redirect("/login");

  return (
    <>
      <Brand />

      <div className="flex flex-col gap-5 rounded-2xl border border-line bg-surface px-5 py-6 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-steel-soft text-accent">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 6l-10 7L2 6" />
            </svg>
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-[22px] font-bold tracking-tight">
              {labels.login.checkTitle}
            </h1>
            <p className="text-[13.5px] text-ink-muted">
              {labels.login.checkSentTo}{" "}
              <span className="break-all font-semibold text-ink">{email}</span>
            </p>
          </div>
        </div>

        <ol className="flex flex-col gap-3">
          {labels.login.steps.map((step, index) => (
            <li key={step} className="flex items-center gap-3">
              <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-steel-soft text-[13px] font-bold text-steel">
                {index + 1}
              </span>
              <span className="text-[14.5px]">{step}</span>
            </li>
          ))}
        </ol>

        <div className="h-px bg-line" />

        <div className="flex flex-col gap-1">
          {wait === "1" && (
            <p role="status" className="text-[13px] font-medium text-steel">
              {labels.login.wait}
            </p>
          )}
          <form
            action={sendLoginLink}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <input type="hidden" name="email" value={email} />
            <span className="text-ink-muted">{labels.login.notArrived}</span>
            <SubmitButton variant="link">{labels.login.resend}</SubmitButton>
          </form>
          <Link
            href={`/login?email=${encodeURIComponent(email)}`}
            className="flex min-h-11 items-center text-sm font-semibold text-steel"
          >
            {labels.login.changeEmail}
          </Link>
        </div>
      </div>
    </>
  );
}
