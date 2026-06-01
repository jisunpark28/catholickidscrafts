import { RecommendationEditor } from "@/components/admin/RecommendationEditor";
import Link from "next/link";

export default function NewRecommendationPage() {
  return (
    <div>
      <Link href="/admin/recommendations" className="text-sm font-semibold text-[var(--color-link)]">
        ← Recommendations
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Add recommendation</h1>
      <div className="mt-6">
        <RecommendationEditor />
      </div>
    </div>
  );
}
