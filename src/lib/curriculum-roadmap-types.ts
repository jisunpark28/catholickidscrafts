export type CurriculumRoadmapStep = {
  id: string;
  title: string;
  description: string;
  href?: string;
  status: "completed" | "current" | "locked" | "available";
};
