/**
 * All cost arithmetic lives here — one place to check, and one place to fix
 * when the real site's rules turn out to differ from our assumptions.
 *
 * Money is handled as plain numbers of Lek at this layer. The database stores
 * Decimal (never float); conversion happens at the edges.
 */

/** A material line: quantity of a unit at a per-unit cost. */
export function materialLineCost(quantity: number, unitCost: number): number {
  return round2(quantity * unitCost);
}

/**
 * A labor line: workers × hours × rate, plus any overtime hours paid at
 * `rate × overtimeMultiplier`.
 */
export function laborLineCost({
  workerCount,
  hoursWorked,
  hourlyRate,
  overtimeHours = 0,
  overtimeMultiplier = 1.5,
}: {
  workerCount: number;
  hoursWorked: number;
  hourlyRate: number;
  overtimeHours?: number;
  overtimeMultiplier?: number;
}): number {
  const regular = workerCount * hoursWorked * hourlyRate;
  const overtime = workerCount * overtimeHours * hourlyRate * overtimeMultiplier;
  return round2(regular + overtime);
}

/** Sum of any set of line costs. */
export function sumLines(lines: { totalCost: number }[]): number {
  return round2(lines.reduce((total, line) => total + line.totalCost, 0));
}

/** The day's cost: materials plus labor. */
export function dayTotal(materialsTotal: number, laborTotal: number): number {
  return round2(materialsTotal + laborTotal);
}

/**
 * Albanian number formatting: "142.000 L" — period as the thousands
 * separator, currency suffixed.
 */
export function formatLek(amount: number): string {
  return `${new Intl.NumberFormat("sq-AL", {
    maximumFractionDigits: 0,
  }).format(amount)} L`;
}

/** Avoids floating-point drift accumulating across many added lines. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
