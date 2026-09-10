"use client";

import { useFormStatus } from "react-dom";

/** A form's submit button that disables itself while the form is sending. */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "link";
}) {
  const { pending } = useFormStatus();

  const style =
    variant === "primary"
      ? "min-h-14 rounded-xl bg-accent px-4 text-[15.5px] font-semibold text-accent-ink"
      : "min-h-11 font-semibold text-steel";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${style} disabled:opacity-60`}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
