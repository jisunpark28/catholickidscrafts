// Server-only: the editable element model of each activity sheet. Only the Plus-checked
// editor API route imports this, so the model never ships in a page or client bundle.
import HAPPY_NEW_CHURCH_YEAR from "@/data/activities/happy-new-church-year.model.json";
import type { ActivityDoc } from "@/lib/resource/activity-doc";

const MODELS: Record<string, ActivityDoc> = {
  "happy-new-church-year": HAPPY_NEW_CHURCH_YEAR as unknown as ActivityDoc,
};

export function getActivityModel(slug: string): ActivityDoc | null {
  return MODELS[slug] ?? null;
}
