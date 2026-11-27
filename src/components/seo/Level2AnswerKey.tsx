/** Parent answer key for a Mass worksheet. Hidden when the page is printed. */
export function Level2AnswerKey({ lines }: { lines: readonly string[] }) {
  if (!lines.length) return null;
  return (
    <details className="print:hidden mt-6 max-w-3xl rounded-2xl border border-[#f0d9b8] bg-white p-4">
      <summary className="cursor-pointer text-base font-semibold text-[#1f2937]">
        Level 2 Answer Key (For Parents &amp; Catechists)
      </summary>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-base leading-relaxed text-[#374151]">
        {lines.map((line) => (
          <li key={line}>{line.replace(/^\d+\.\s*/, "")}</li>
        ))}
      </ol>
    </details>
  );
}
