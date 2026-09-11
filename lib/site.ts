import { headers } from "next/headers";

/** This site's own address, so email links come back here — live or local. */
export async function siteOrigin(): Promise<string> {
  const h = await headers();
  return h.get("origin") ?? `https://${h.get("host")}`;
}
