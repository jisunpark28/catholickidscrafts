"use client";

import { useEffect, useRef } from "react";

type Props = { slug: string };

/** Records a view for popularity sorting (once per page load). */
export function ResourceViewTracker({ slug }: Props) {
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    void fetch(`/api/resources/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      keepalive: true,
    });
  }, [slug]);

  return null;
}
