import type { ReactNode } from "react";

/** Simple line symbols for the Mass sheets. No faces, and no lamb. */

function IconFrame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 64 64" width="48" height="48" aria-hidden="true">
      {children}
    </svg>
  );
}

export function AltarSymbol() {
  return (
    <IconFrame>
      <rect x="10" y="28" width="44" height="8" rx="1.5" fill="none" stroke="#111" strokeWidth="2.5" />
      <path d="M18 36v14M46 36v14M14 50h36" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 10v14M26 16h12" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
    </IconFrame>
  );
}

export function CrossSymbol() {
  return (
    <IconFrame>
      <path d="M32 8v48M18 20h28" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" />
    </IconFrame>
  );
}

export function BookSymbol() {
  return (
    <IconFrame>
      <path d="M10 16h18c3 0 6 2 6 6v28c-4-3-8-4-12-4H10V16z" fill="none" stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M54 16H36c-3 0-6 2-6 6v28c4-3 8-4 12-4h12V16z" fill="none" stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M32 14v36" fill="none" stroke="#111" strokeWidth="2" />
    </IconFrame>
  );
}

const SYMBOLS = {
  altar: AltarSymbol,
  cross: CrossSymbol,
  book: BookSymbol,
} as const;

export type MassSymbolName = keyof typeof SYMBOLS;

export function MassSymbolRow({ names }: { names: readonly MassSymbolName[] }) {
  return (
    <div className="gs-ph-icons">
      {names.map((name) => {
        const Symbol = SYMBOLS[name];
        return (
          <div key={name} className="gs-symbol">
            <Symbol />
          </div>
        );
      })}
    </div>
  );
}
