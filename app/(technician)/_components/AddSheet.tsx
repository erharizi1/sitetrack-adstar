"use client";

import { formatLek } from "@/lib/cost";
import { labels } from "@/lib/labels";

export type Preset = {
  id: string;
  name: string;
  /** "950 L / thes" or "450 L / orë" — shown under the name. */
  rateLabel: string;
};

type NumberField = {
  key: string;
  label: string;
  value: number;
  step: number;
  min: number;
  unit?: string;
};

/**
 * The add-flow, shared by both tabs.
 *
 * On phone it's a bottom sheet (thumb-reachable, one thing at a time). From
 * `sm:` up there's room to show it as a centred panel instead — same content,
 * no separate component to keep in sync.
 */
export function AddSheet({
  title,
  presets,
  selectedId,
  onSelect,
  fields,
  onFieldChange,
  lineCost,
  onSubmit,
  onClose,
  pending,
}: {
  title: string;
  presets: Preset[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  fields: NumberField[];
  onFieldChange: (key: string, value: number) => void;
  lineCost: number;
  onSubmit: () => void;
  onClose: () => void;
  pending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={labels.technician.cancel}
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />

      <div className="relative flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-surface shadow-xl sm:max-w-md sm:rounded-2xl">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-9 rounded-full bg-line" />
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-5 pt-2 pb-4">
          <h2 className="text-[17px] font-semibold">{title}</h2>

          <div className="flex flex-col gap-2">
            {presets.map((preset) => {
              const active = preset.id === selectedId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelect(preset.id)}
                  className={`flex min-h-[52px] items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                    active
                      ? "bg-accent text-accent-ink"
                      : "border border-line bg-surface"
                  }`}
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold">
                      {preset.name}
                    </span>
                    <span
                      className={`text-xs ${active ? "opacity-85" : "text-ink-muted"}`}
                    >
                      {preset.rateLabel}
                    </span>
                  </span>
                  {active && (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 border-t border-line pt-4">
            {fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-2">
                <span className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                  {field.label}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="−"
                    onClick={() =>
                      onFieldChange(
                        field.key,
                        Math.max(field.min, field.value - field.step),
                      )
                    }
                    className="h-11 w-11 rounded-xl border border-line text-xl"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-xl font-semibold">
                    {field.value}
                    {field.unit && (
                      <span className="ml-1 text-[13px] font-medium text-ink-muted">
                        {field.unit}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    aria-label="+"
                    onClick={() =>
                      onFieldChange(field.key, field.value + field.step)
                    }
                    className="h-11 w-11 rounded-xl border border-line text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between rounded-xl bg-bg px-4 py-3">
              <span className="text-[13px] font-semibold text-ink-muted">
                {labels.technician.lineCost}
              </span>
              <span className="text-[17px] font-bold">
                {formatLek(lineCost)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-5 pt-2 pb-6">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!selectedId || pending}
            className="min-h-[52px] rounded-xl bg-accent px-4 text-[15px] font-semibold text-accent-ink disabled:opacity-50"
          >
            {labels.technician.addToLog}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] text-[14px] font-semibold text-ink-muted"
          >
            {labels.technician.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
