import { LockedPreview } from "./LockedPreview";

/** Decorative worksheet silhouette only: never send locked worksheet text to the browser. */
export function LockedSheetPreview({ title }: { title: string }) {
  return (
    <LockedPreview className="rounded-xl border border-[#ece7e1] bg-white" label={title + ": unlock with Plus"}>
      <span className="block aspect-[17/22] overflow-hidden p-[8%]" style={{ filter: "blur(4px)" }}>
        <span className="mx-auto mb-[12%] block h-5 w-3/4 rounded bg-[#9ca3af]" />
        {[0, 1, 2].map((section) => (
          <span key={section} className="mb-[10%] block rounded-lg border border-[#d1d5db] p-[6%]">
            <span className="mb-3 block h-3 w-1/2 rounded bg-[#9ca3af]" />
            {[0, 1, 2, 3].map((line) => <span key={line} className="mb-2 block h-2 rounded bg-[#d1d5db]" />)}
          </span>
        ))}
      </span>
    </LockedPreview>
  );
}
