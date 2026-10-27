"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const Editor = dynamic(
  () => import("@/components/resource/SheetFabricEditor").then((m) => m.SheetFabricEditor),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-8 text-center text-sm text-[#6b7280]">
        Loading editor…
      </div>
    ),
  },
);

export function SheetFabricEditorLazy(props: ComponentProps<typeof Editor>) {
  return <Editor {...props} />;
}
