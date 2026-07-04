"use client";

import { LessonRunHeader } from "@/components/lesson/LessonRunHeader";
import { LessonRunner } from "@/components/lesson/LessonRunner";
import {
  precacheLessonGameAssets,
  saveLessonKitOffline,
} from "@/lib/lesson-kit/offline-cache";
import type { LessonKitDto } from "@/lib/lesson-kit/types";
import { useEffect } from "react";

type Props = {
  kit: LessonKitDto;
  mode: "classroom" | "family";
  subtitle?: string;
};

export function LessonRunClient({ kit, mode, subtitle }: Props) {
  useEffect(() => {
    saveLessonKitOffline(kit);
    void precacheLessonGameAssets(kit);
  }, [kit]);

  return (
    <>
      <LessonRunHeader title={kit.title} subtitle={subtitle} />
      <LessonRunner kit={kit} mode={mode} />
    </>
  );
}
