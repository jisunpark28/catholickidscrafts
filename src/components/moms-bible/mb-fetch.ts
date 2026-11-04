/** Same-origin JSON calls to /api/moms-bible. */
export type MbResult<T = unknown> = { ok: true; data: T } | { ok: false; status: number; error: string };

export async function mbFetch<T = unknown>(path: string, method = "GET", body?: unknown): Promise<MbResult<T>> {
  try {
    const res = await fetch(path, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) return { ok: false, status: res.status, error: data?.error || "Something went wrong. Please try again." };
    return { ok: true, data };
  } catch {
    return { ok: false, status: 0, error: "Couldn't reach the server. Check your connection." };
  }
}
