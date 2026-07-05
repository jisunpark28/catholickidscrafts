"use client";

import { useEffect, useRef } from "react";
import { recordResourceView } from "@/lib/record-resource-view";

type Props = { slug: string };

/** Records a view for popularity sorting (once per page load). */
export function ResourceViewTracker({ slug }: Props) {
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    void recordResourceView(slug);
  }, [slug]);

  return null;
}
