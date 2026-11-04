"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Called with the 4 digits once they are all typed. */
  onComplete: (pin: string) => void;
  disabled?: boolean;
  /** Bump to clear the dots (e.g. after a wrong PIN). */
  resetKey?: number;
  label: string;
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

/** Big 4-digit PIN pad for kids. Works with taps and with a keyboard. The PIN stays in memory only. */
export function KidPinPad({ onComplete, disabled, resetKey = 0, label }: Props) {
  const [pin, setPin] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPin("");
    inputRef.current?.focus();
  }, [resetKey]);

  function update(next: string) {
    const digits = next.replace(/\D/g, "").slice(0, 4);
    setPin(digits);
    if (digits.length === 4) onComplete(digits);
  }

  const keyClass =
    "flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--color-border)] bg-white text-2xl font-bold text-[var(--color-ink)] hover:border-[var(--color-accent)] active:scale-95 disabled:opacity-50 sm:h-[4.5rem] sm:w-[4.5rem]";

  return (
    <div className="flex flex-col items-center">
      <label className="sr-only" htmlFor="kid-pin-input">
        {label}
      </label>
      <input
        id="kid-pin-input"
        ref={inputRef}
        type="password"
        inputMode="numeric"
        autoComplete="off"
        pattern="[0-9]*"
        maxLength={4}
        value={pin}
        disabled={disabled}
        onChange={(e) => update(e.target.value)}
        className="sr-only"
      />
      <div className="flex gap-4" aria-hidden onClick={() => inputRef.current?.focus()}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-5 w-5 rounded-full border-2 border-[var(--color-accent)] ${
              i < pin.length ? "bg-[var(--color-accent)]" : "bg-white"
            }`}
          />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        {KEYS.map((k) => (
          <button key={k} type="button" className={keyClass} disabled={disabled} onClick={() => update(pin + k)}>
            {k}
          </button>
        ))}
        <span />
        <button type="button" className={keyClass} disabled={disabled} onClick={() => update(pin + "0")}>
          0
        </button>
        <button
          type="button"
          className={`${keyClass} text-xl`}
          disabled={disabled || pin.length === 0}
          onClick={() => update(pin.slice(0, -1))}
          aria-label="Delete last digit"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
