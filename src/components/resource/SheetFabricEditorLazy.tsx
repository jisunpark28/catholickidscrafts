"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const Editor = dynamic(
  () =>
    import("@/components/resource/SheetFabricEditor")
      .then((m) => m.SheetFabricEditor)
      .catch((err) => {
        console.error("[SheetFabricEditorLazy] failed to load editor chunk", err);
        function LoadError() {
          return (
            <div className="rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-8 text-center text-sm text-[#6b7280]">
              Could not load the editor. Please refresh and try again.
            </div>
          );
        }
        return LoadError;
      }),
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
