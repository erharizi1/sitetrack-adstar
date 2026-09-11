import { redirect } from "next/navigation";
import { sendLoginLink } from "@/actions/auth";
import { Brand } from "@/components/Brand";
import { SubmitButton } from "@/components/SubmitButton";
import { getCurrentProfile, homeFor } from "@/lib/auth";
import { labels } from "@/lib/labels";

const ERRORS: Record<string, string> = {
  email: labels.login.invalidEmail,
  account: labels.login.noAccount,
  deactivated: labels.login.deactivated,
};

/** Login — docs/design/final-designs/login/Login.dc.html */
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const profile = await getCurrentProfile();
  if (profile?.status === "active") redirect(homeFor(profile.role));

  const { error, email } = await searchParams;
  const message = typeof error === "string" ? ERRORS[error] : undefined;

  return (
    <>
      <div className="flex flex-col gap-[18px]">
        <Brand />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[26px] font-bold tracking-tight">
            {labels.login.title}
          </h1>
          <p className="text-[14.5px] leading-normal text-ink-muted">
            {labels.login.subtitle}
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
            defaultValue={typeof email === "string" ? email : ""}
            placeholder={labels.login.emailPlaceholder}
            className="min-h-[52px] rounded-xl border-2 border-line bg-surface px-4 text-[15px] outline-none focus:border-accent"
          />
        </label>
        {message && (
          <p role="alert" className="text-sm font-medium text-red-700">
            {message}
          </p>
        )}
        <SubmitButton pendingLabel={labels.login.sending}>
          {labels.login.send}
        </SubmitButton>
      </form>

      <p className="text-center text-[12.5px] text-ink-muted">
        {labels.login.footer}
      </p>
    </>
  );
}
