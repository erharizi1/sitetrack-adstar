/**
 * Who each role adds and manages: only the role directly below it
 * (docs/decisions/log.md, "Three roles"). Nobody adds people at their own level.
 */
export function childRole(role: string): "engineer" | "technician" | null {
  if (role === "owner") return "engineer";
  if (role === "engineer") return "technician";
  return null;
}
