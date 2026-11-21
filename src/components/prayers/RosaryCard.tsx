"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LearnGateDialog } from "@/components/learn/LearnGateDialog";
import { signInPath } from "@/lib/sign-in-callback";
import { RosaryPrayer } from "./RosaryPrayer";
import "@/styles/rosary.css";

/** Prayer grid card that opens the full-screen interactive Rosary (same look as the other prayer cards). */
export function RosaryCard({ signedIn, sessionReady }: { signedIn: boolean; sessionReady: boolean }) {
  const [open, setOpen] = useState(false);
  const [gate, setGate] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const apply = useCallback((hash: string) => {
    if (hash !== "#rosary") {
      setOpen(false);
      setGate(false);
      return;
    }
    if (!sessionReady) return;
    if (signedIn) {
      setGate(false);
      setOpen(true);
    } else {
      setOpen(false);
      setGate(true);
    }
  }, [sessionReady, signedIn]);

  useEffect(() => {
    const check = () => apply(window.location.hash);
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, [apply]);

  const close = useCallback(() => {
    setOpen(false);
    setGate(false);
    if (window.location.hash === "#rosary") {
      history.pushState(history.state, "", window.location.pathname + window.location.search);
    }
    requestAnimationFrame(() => btnRef.current?.focus());
  }, []);

  return (
    <li>
      <div className="qa-card" data-qa-card="rosary" style={{ "--qa-p": "#E6F4EA" } as React.CSSProperties}>
        <div className="qa-inner">
          <button
            ref={btnRef}
            type="button"
            className="qa-face qa-front"
            aria-haspopup="dialog"
            onClick={() => {
              if (window.location.hash !== "#rosary") {
                history.pushState(history.state, "", `${window.location.pathname}${window.location.search}#rosary`);
              }
              apply("#rosary");
            }}
          >
            <span className="qa-ill qa-ill--rosary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/rosary/complete-mary-lamb.png" alt="" loading="lazy" />
            </span>
            <span className="qa-q">The Rosary</span>
            <span className="qa-when">Pray the mysteries with Mary</span>
            <span className="qa-hint">Tap to pray ↻</span>
          </button>
        </div>
      </div>
      <RosaryPrayer open={open} onClose={close} />
      {gate ? (
        <LearnGateDialog
          title="The Rosary"
          message="Sign up to learn and practice this prayer."
          imageSrc="/rosary/complete-mary-lamb.png"
          imageAlt=""
          signInHref={signInPath("/prayers#rosary")}
          onClose={close}
        />
      ) : null}
    </li>
  );
}
