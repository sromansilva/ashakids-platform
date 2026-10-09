import type { Page } from "@/api/client";
/** Used by existing calendar/child selectors that need the full authorized set. */
export async function readAllPages<T>(read: (offset: number) => Promise<Page<T>>, signal: AbortSignal): Promise<T[]> {
  const rows: T[] = [];
  while (!signal.aborted) {
    const page = await read(rows.length);
    rows.push(...page.items);
    if (rows.length >= page.total || !page.items.length) return rows;
  }
  throw new DOMException("Cancelado", "AbortError");
}
