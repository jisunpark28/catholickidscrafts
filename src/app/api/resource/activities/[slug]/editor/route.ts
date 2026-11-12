import { parentApiGuard } from "@/lib/family-auth";
import { getActivity } from "@/lib/resource/activities";
import { getActivityModel } from "@/lib/resource/activity-models";
import { familyHasPlus, plusRequiredResponse } from "@/lib/subscription/entitlements";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

const noStore = { "Cache-Control": "private, no-store" };

/**
 * Editable element model of an activity sheet, for the in-browser editor.
 * Plus only: signed-in parent (401 / 403 otherwise) with an active Plus pass (402), checked on every request.
 */
export async function GET(_request: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const activity = getActivity(slug);
  const model = activity ? getActivityModel(activity.slug) : null;
  if (!activity || !model) return NextResponse.json({ error: "Not found" }, { status: 404, headers: noStore });

  const guard = await parentApiGuard();
  if (guard.error) {
    guard.error.headers.set("Cache-Control", noStore["Cache-Control"]);
    return guard.error;
  }
  if (!(await familyHasPlus(guard.session.familyAccountId))) {
    const res = plusRequiredResponse();
    res.headers.set("Cache-Control", noStore["Cache-Control"]);
    return res;
  }
  return NextResponse.json(model, { headers: noStore });
}
