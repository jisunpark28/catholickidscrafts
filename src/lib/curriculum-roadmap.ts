import type { CurriculumTrack, ResourcePost } from "@/lib/content-types";
import type { CurriculumRoadmapStep } from "@/lib/curriculum-roadmap-types";

/** UI-first roadmap: first linked resource is current; placeholders fill lessonCount gap. */
export function buildCurriculumRoadmapSteps(
  track: CurriculumTrack,
  resources: ResourcePost[],
): CurriculumRoadmapStep[] {
  const steps: CurriculumRoadmapStep[] = resources.map((resource, index) => ({
    id: resource.slug,
    title: resource.title,
    description: resource.excerpt,
    href: `/resources/${resource.slug}`,
    status: index === 0 ? "current" : "available",
  }));

  for (let i = resources.length; i < track.lessonCount; i += 1) {
    steps.push({
      id: `placeholder-${i}`,
      title: `Lesson ${i + 1}`,
      description: "More lessons coming soon in this track.",
      status: "locked",
    });
  }

  return steps;
}
