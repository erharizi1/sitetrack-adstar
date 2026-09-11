"use client";

import { useState, useTransition } from "react";
import {
  deactivatePerson,
  invitePerson,
  reactivatePerson,
  resendInvite,
  type TeamResult,
} from "@/actions/team";
import { labels } from "@/lib/labels";

type Status = keyof typeof labels.team.status;
type AddedRole = "engineer" | "technician";

export type Person = {
  id: string;
  name: string;
  email: string;
  status: string;
  /** "2 orë më parë" while an invite is pending, otherwise null. */
  invitedAgo: string | null;
};

const BADGE: Record<Status, string> = {
  active: "bg-good-soft text-good",
  invited: "bg-amber-100 text-amber-700",
  deactivated: "bg-line text-ink-muted",
};

const t = labels.team;

/**
 * The team list with the add form beside it —
 * docs/design/final-designs/invite/TeamPanel.dc.html (desktop) and
 * TeamPhone.dc.html (phone, where the form is a bottom sheet).
 */
export function TeamScreen({
  role,
  projects,
  people,
}: {
  role: AddedRole;
  projects: { id: string; name: string }[];
  people: Person[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const addLabel = role === "technician" ? t.addTechnician : t.addEngineer;

  function run(action: () => Promise<TeamResult>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if ("error" in result) setError(t.errors[result.error]);
    });
  }

  return (
    <div className="flex flex-col gap-5 px-5 py-6 sm:px-10 sm:py-8">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-sm text-ink-muted">
            {projects.map((project) => project.name).join(", ")} · {people.length}{" "}
            {t.plural[role]}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-accent px-4 text-[14.5px] font-semibold text-accent-ink"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <path d="M20 8v6M23 11h-6" />
          </svg>
          <span>{addLabel}</span>
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {people.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface px-4 py-8 text-center text-sm text-ink-muted">
          {t.empty}
        </p>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-line bg-surface">
          <li className="hidden gap-4 border-b border-line px-5 py-3 text-xs font-semibold tracking-wide text-ink-muted uppercase md:flex">
            <span className="w-44">{t.columns.name}</span>
            <span className="flex-1">{t.columns.email}</span>
            <span className="w-40">{t.columns.status}</span>
            <span className="w-28" />
          </li>
          {people.map((person, index) => {
            const status = (person.status in BADGE ? person.status : "deactivated") as Status;
            return (
              <li
                key={person.id}
                className={`flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 md:flex-nowrap md:px-5 ${
                  index < people.length - 1 ? "border-b border-line" : ""
                } ${status === "deactivated" ? "text-ink-muted" : ""}`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 md:w-44 md:flex-none">
                  <span className="text-[14.5px] font-semibold">{person.name}</span>
                  <span className="truncate text-[12.5px] text-ink-muted md:hidden">
                    {person.email}
                  </span>
                </div>
                <span className="hidden min-w-0 flex-1 truncate text-sm text-ink-muted md:block">
                  {person.email}
                </span>
                <div className="flex flex-col items-start gap-1 md:w-40">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${BADGE[status]}`}
                  >
                    {t.status[status]}
                  </span>
                  {person.invitedAgo && (
                    <span className="hidden text-xs text-ink-muted md:block">
                      {t.invitedAgo} {person.invitedAgo}
                    </span>
                  )}
                </div>
                <div className="w-full text-right md:w-28">
                  {status === "invited" && (
                    <RowButton disabled={pending} onClick={() => run(() => resendInvite(person.id))}>
                      {t.resend}
                    </RowButton>
                  )}
                  {status === "active" && (
                    <RowButton
                      disabled={pending}
                      tone="ink"
                      onClick={() => run(() => deactivatePerson(person.id))}
                    >
                      {t.deactivate}
                    </RowButton>
                  )}
                  {status === "deactivated" && (
                    <RowButton disabled={pending} onClick={() => run(() => reactivatePerson(person.id))}>
                      {t.reactivate}
                    </RowButton>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {open && (
        <AddPersonPanel
          role={role}
          title={addLabel}
          projects={projects}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function RowButton({
  children,
  onClick,
  disabled,
  tone = "steel",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  tone?: "steel" | "ink";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-h-11 text-sm font-semibold disabled:opacity-50 ${
        tone === "ink" ? "text-ink" : "text-steel"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * The add form. On phone a bottom sheet over the list; from `lg:` up a panel
 * down the right side, with the list still visible beside it.
 */
function AddPersonPanel({
  role,
  title,
  projects,
  onClose,
}: {
  role: AddedRole;
  title: string;
  projects: { id: string; name: string }[];
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await invitePerson({
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        email: String(formData.get("email") ?? ""),
        projectId,
      });
      if ("error" in result) setError(t.errors[result.error]);
      else onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-stretch lg:justify-end">
      <button
        type="button"
        aria-label={t.close}
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 lg:bg-ink/10"
      />

      <form
        action={submit}
        className="relative flex max-h-[90dvh] w-full flex-col overflow-y-auto rounded-t-2xl bg-surface shadow-xl lg:max-h-none lg:w-[420px] lg:rounded-none lg:border-l lg:border-line"
      >
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div className="h-1 w-9 rounded-full bg-line" />
        </div>

        <div className="flex flex-1 flex-col gap-4 px-5 pt-2 pb-4 lg:gap-5 lg:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-bold lg:text-lg">{title}</h2>
              <p className="text-[13px] leading-normal text-ink-muted lg:text-sm">
                {t.panelHint}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close}
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-muted lg:flex"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t.firstName} name="firstName" autoComplete="given-name" />
            <Field label={t.lastName} name="lastName" autoComplete="family-name" />
          </div>
          <Field
            label={t.email}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
          />
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">{t.project}</span>
            <select
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              className="min-h-12 rounded-xl border border-line bg-surface px-3.5 text-[15px]"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] font-semibold">{t.role}</span>
            <span className="rounded-full bg-steel-soft px-2.5 py-1 text-xs font-semibold text-steel">
              {labels.roles[role]}
            </span>
          </div>
          {error && (
            <p role="alert" className="text-sm font-medium text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 px-5 pt-2 pb-6 lg:px-7 lg:pb-7">
          <button
            type="submit"
            disabled={pending || !projectId}
            className="min-h-[52px] rounded-xl bg-accent px-4 text-[15px] font-semibold text-accent-ink disabled:opacity-60"
          >
            {pending ? t.sending : t.send}
          </button>
          <p className="text-center text-[12.5px] text-ink-muted">{t.linkHint}</p>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 text-[14.5px] font-semibold text-ink-muted lg:hidden"
          >
            {t.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  ...input
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold">{label}</span>
      <input
        required
        {...input}
        className="min-h-12 rounded-xl border border-line bg-surface px-3.5 text-[15px] outline-none focus:border-2 focus:border-accent"
      />
    </label>
  );
}
