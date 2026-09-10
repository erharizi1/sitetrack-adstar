"use client";

import { useState, useTransition } from "react";
import {
  addLabor,
  addMaterial,
  removeLabor,
  removeMaterial,
  submitDay,
} from "@/actions/daily-log";
import { dayTotal, formatLek, laborLineCost, materialLineCost } from "@/lib/cost";
import { labels } from "@/lib/labels";
import { AddSheet, type Preset } from "./AddSheet";
import { LogStatusBadge } from "./LogStatusBadge";

export type MaterialPreset = {
  id: string;
  name: string;
  defaultUnit: string;
  defaultCost: number;
};

export type LaborPreset = {
  id: string;
  name: string;
  baseHourlyRate: number;
};

export type MaterialLine = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
};

export type LaborLine = {
  id: string;
  roleName: string;
  workerCount: number;
  hoursWorked: number;
  hourlyRate: number;
  totalCost: number;
};

type Tab = "materials" | "labor";

export function DailyLogScreen({
  projectId,
  projectName,
  dateLabel,
  dailyLogId,
  status,
  materialPresets,
  laborPresets,
  materialLines,
  laborLines,
  materialsTotal,
  laborTotal,
}: {
  projectId: string;
  projectName: string;
  dateLabel: string;
  dailyLogId: string | null;
  status: string;
  materialPresets: MaterialPreset[];
  laborPresets: LaborPreset[];
  materialLines: MaterialLine[];
  laborLines: LaborLine[];
  materialsTotal: number;
  laborTotal: number;
}) {
  const [tab, setTab] = useState<Tab>("materials");
  const [sheet, setSheet] = useState<Tab | null>(null);
  const [pending, startTransition] = useTransition();

  const [materialId, setMaterialId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [laborRoleId, setLaborRoleId] = useState<string | null>(null);
  const [workerCount, setWorkerCount] = useState(1);
  const [hoursWorked, setHoursWorked] = useState(8);

  const submitted = status !== "draft";
  const total = dayTotal(materialsTotal, laborTotal);

  const selectedMaterial = materialPresets.find((m) => m.id === materialId);
  const selectedRole = laborPresets.find((r) => r.id === laborRoleId);

  function closeSheet() {
    setSheet(null);
    setMaterialId(null);
    setLaborRoleId(null);
    setQuantity(1);
    setWorkerCount(1);
    setHoursWorked(8);
  }

  function handleAddMaterial() {
    if (!materialId) return;
    startTransition(async () => {
      await addMaterial({ projectId, materialId, quantity });
      closeSheet();
    });
  }

  function handleAddLabor() {
    if (!laborRoleId) return;
    startTransition(async () => {
      await addLabor({ projectId, laborRoleId, workerCount, hoursWorked });
      closeSheet();
    });
  }

  const otherTab: Tab = tab === "materials" ? "labor" : "materials";
  const otherCount =
    otherTab === "materials" ? materialLines.length : laborLines.length;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
      <header className="flex flex-col gap-1 px-5 pt-6">
        <h1 className="text-base font-semibold">{projectName}</h1>
        <div className="flex items-center gap-2 text-[12.5px] text-ink-muted">
          <span>
            {labels.engineer.title} · {dateLabel}
          </span>
          {submitted && <LogStatusBadge status={status} />}
        </div>
      </header>

      <div className="px-5 pt-4">
        <div className="flex gap-1.5 rounded-xl border border-line bg-surface p-1">
          {(["materials", "labor"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`min-h-[44px] flex-1 rounded-lg text-[13.5px] font-semibold transition ${
                tab === key
                  ? "bg-accent text-accent-ink"
                  : "text-ink-muted"
              }`}
            >
              {labels.engineer.tabs[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-5 pt-4 pb-56">
        {tab === "materials" ? (
          <>
            <LineList
              empty={labels.engineer.emptyMaterials}
              items={materialLines.map((line) => ({
                id: line.id,
                title: line.name,
                detail: `${line.quantity} ${line.unit} × ${formatLek(line.unitCost)}`,
                cost: line.totalCost,
              }))}
              onRemove={(id) =>
                startTransition(async () => {
                  await removeMaterial(id);
                })
              }
              disabled={submitted || pending}
            />
            {!submitted && (
              <AddButton
                label={labels.engineer.addMaterial}
                onClick={() => setSheet("materials")}
              />
            )}
          </>
        ) : (
          <>
            <LineList
              empty={labels.engineer.emptyLabor}
              items={laborLines.map((line) => ({
                id: line.id,
                title: line.roleName,
                detail: `${line.workerCount} × ${line.hoursWorked} orë × ${formatLek(line.hourlyRate)}`,
                cost: line.totalCost,
              }))}
              onRemove={(id) =>
                startTransition(async () => {
                  await removeLabor(id);
                })
              }
              disabled={submitted || pending}
            />
            {!submitted && (
              <AddButton
                label={labels.engineer.addLabor}
                onClick={() => setSheet("labor")}
              />
            )}
          </>
        )}

        {otherCount > 0 && (
          <p className="mt-2 rounded-xl bg-steel-soft px-3.5 py-3 text-xs font-medium text-steel">
            {labels.engineer.tabs[otherTab]}: {otherCount} —{" "}
            {labels.engineer.otherTabHint}
          </p>
        )}
      </div>

      {/* Always visible: the day stays one thing even while a tab is focused. */}
      <div className="sticky bottom-0 flex flex-col gap-2.5 bg-linear-to-b from-transparent to-bg to-30% px-5 pt-4 pb-6">
        <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface px-4.5 py-3.5">
          <Row
            label={labels.engineer.subtotalMaterials}
            value={formatLek(materialsTotal)}
          />
          <Row
            label={labels.engineer.subtotalLabor}
            value={formatLek(laborTotal)}
          />
          <div className="h-px bg-line" />
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold">
              {labels.engineer.dayTotal}
            </span>
            <span className="text-[19px] font-bold text-accent">
              {formatLek(total)}
            </span>
          </div>
        </div>

        {!submitted && (
          <>
            <button
              type="button"
              disabled={!dailyLogId || pending}
              onClick={() =>
                dailyLogId &&
                startTransition(async () => {
                  await submitDay(dailyLogId);
                })
              }
              className="min-h-[56px] rounded-xl bg-accent px-4 text-[15.5px] font-semibold text-accent-ink disabled:opacity-50"
            >
              {pending ? labels.engineer.submitting : labels.engineer.submit}
            </button>
            <p className="text-center text-xs text-ink-muted">
              {labels.engineer.submitHint}
            </p>
          </>
        )}
      </div>

      {sheet === "materials" && (
        <AddSheet
          title={labels.engineer.chooseMaterial}
          presets={materialPresets.map(
            (m): Preset => ({
              id: m.id,
              name: m.name,
              rateLabel: `${formatLek(m.defaultCost)} / ${m.defaultUnit}`,
            }),
          )}
          selectedId={materialId}
          onSelect={setMaterialId}
          fields={[
            {
              key: "quantity",
              label: labels.engineer.quantity,
              value: quantity,
              step: 1,
              min: 1,
              unit: selectedMaterial?.defaultUnit,
            },
          ]}
          onFieldChange={(_, value) => setQuantity(value)}
          lineCost={
            selectedMaterial
              ? materialLineCost(quantity, selectedMaterial.defaultCost)
              : 0
          }
          onSubmit={handleAddMaterial}
          onClose={closeSheet}
          pending={pending}
        />
      )}

      {sheet === "labor" && (
        <AddSheet
          title={labels.engineer.chooseLabor}
          presets={laborPresets.map(
            (r): Preset => ({
              id: r.id,
              name: r.name,
              rateLabel: `${formatLek(r.baseHourlyRate)} / orë`,
            }),
          )}
          selectedId={laborRoleId}
          onSelect={setLaborRoleId}
          fields={[
            {
              key: "workerCount",
              label: labels.engineer.workers,
              value: workerCount,
              step: 1,
              min: 1,
            },
            {
              key: "hoursWorked",
              label: labels.engineer.hours,
              value: hoursWorked,
              step: 1,
              min: 1,
              unit: "orë",
            },
          ]}
          onFieldChange={(key, value) =>
            key === "workerCount" ? setWorkerCount(value) : setHoursWorked(value)
          }
          lineCost={
            selectedRole
              ? laborLineCost({
                  workerCount,
                  hoursWorked,
                  hourlyRate: selectedRole.baseHourlyRate,
                })
              : 0
          }
          onSubmit={handleAddLabor}
          onClose={closeSheet}
          pending={pending}
        />
      )}
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[12.5px] text-ink-muted">
      <span>{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

function AddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-line text-[14px] font-semibold text-steel"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
      {label}
    </button>
  );
}

function LineList({
  items,
  empty,
  onRemove,
  disabled,
}: {
  items: { id: string; title: string; detail: string; cost: number }[];
  empty: string;
  onRemove: (id: string) => void;
  disabled: boolean;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-surface px-4 py-8 text-center text-sm text-ink-muted">
        {empty}
      </p>
    );
  }

  return (
    <ul className="overflow-hidden rounded-xl border border-line bg-surface">
      {items.map((item, index) => (
        <li
          key={item.id}
          className={`flex items-center justify-between px-4 py-3.5 ${
            index < items.length - 1 ? "border-b border-line" : ""
          }`}
        >
          <span className="flex flex-col gap-0.5">
            <span className="text-[14.5px] font-semibold">{item.title}</span>
            <span className="text-[12.5px] text-ink-muted">{item.detail}</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="text-[14.5px] font-semibold">
              {formatLek(item.cost)}
            </span>
            {!disabled && (
              <button
                type="button"
                aria-label={labels.engineer.remove}
                onClick={() => onRemove(item.id)}
                className="p-1 text-ink-muted"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                </svg>
              </button>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
