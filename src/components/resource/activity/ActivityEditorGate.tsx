"use client";

import { activityEditorDocPath, activityPath } from "@/lib/resource/activities";
import { parseActivityDoc, type ActivityDoc } from "@/lib/resource/activity-doc";
import { ONE_TIME_LINE } from "@/lib/subscription/plan-copy";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ActivitySignInPrompt } from "./ActivitySignInPrompt";

const ActivitySheetEditor = dynamic(() => import("./ActivitySheetEditor").then((m) => m.ActivitySheetEditor), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

type State =
  | { kind: "loading" }
  | { kind: "ready"; doc: ActivityDoc }
  | { kind: "signin" }
  | { kind: "child" }
  | { kind: "plus" }
  | { kind: "error"; message: string };

function EditorSkeleton() {
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]" aria-busy="true" aria-label="Loading the editor">
      <div className="aspect-[612/792] w-full max-w-[816px] animate-pulse rounded-2xl bg-[#f3f1ee]" />
      <div className="h-64 animate-pulse rounded-2xl bg-[#f3f1ee]" />
    </div>
  );
}

/**
 * Loads the editable sheet from the Plus-checked API. The server decides: 401 signed out,
 * 403 child mode, 402 no Plus. Nothing editable reaches the browser without Plus.
 */
export function ActivityEditorGate({ slug, title }: { slug: string; title: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const res = await fetch(activityEditorDocPath(slug), { credentials: "same-origin", cache: "no-store" });
        if (!alive) return;
        if (res.status === 401) return setState({ kind: "signin" });
        if (res.status === 403) return setState({ kind: "child" });
        if (res.status === 402) return setState({ kind: "plus" });
        if (!res.ok) return setState({ kind: "error", message: "The editor is not available right now. Please try again." });
        const doc = parseActivityDoc(await res.json());
        if (!alive) return;
        setState(doc ? { kind: "ready", doc } : { kind: "error", message: "This sheet could not be opened." });
      } catch {
        if (alive) setState({ kind: "error", message: "Could not reach the editor. Check your connection and try again." });
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  if (state.kind === "loading") return <EditorSkeleton />;
  if (state.kind === "ready") return <ActivitySheetEditor original={state.doc} />;

  const back = (
    <Link
      href={activityPath(slug)}
      className="rounded-full border border-[#e7e3de] bg-white px-5 py-2.5 text-sm font-medium text-[#1c1c1c] no-underline hover:bg-[#fffdfb]"
    >
      Back to the free download
    </Link>
  );

  if (state.kind === "signin") {
    return (
      <div className="mx-auto mt-6 max-w-lg">
        <ActivitySignInPrompt
          title="Sign in to open the editor"
          body={`Editing ${title} is a Plus feature. Sign in first; downloading the sheet is free for every family.`}
        />
        <div className="mt-4 text-center">{back}</div>
      </div>
    );
  }

  return (
    <section
      aria-label="Plus required"
      className="mx-auto mt-6 max-w-lg rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-6 py-8 text-center"
    >
      {state.kind === "plus" ? (
        <>
          <p className="m-0 text-xs font-bold uppercase tracking-wide text-[#d35400]">🔒 Plus editor</p>
          <h2 className="mb-2 mt-2 text-xl font-bold text-[#1c1c1c]">Make {title} your own</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#4b5563]">
            Plus members can change every word, line and dot on this sheet, choose black &amp; white or colour, and
            print or download their own PDF. The ready-made sheet stays free for signed-in families.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/subscribe"
              className="rounded-full bg-[#d35400] px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-[#b8470a]"
            >
              Unlock with Plus
            </Link>
            {back}
          </div>
          <p className="mb-0 mt-3 text-xs font-semibold text-[#6b7280]">{ONE_TIME_LINE}</p>
        </>
      ) : state.kind === "child" ? (
        <>
          <p className="m-0 text-sm text-[#4b5563]">
            Grown-ups only: sign in with Google again to return to the parent account.
          </p>
          <div className="mt-4">{back}</div>
        </>
      ) : (
        <>
          <p role="alert" className="m-0 text-sm text-[#4b5563]">
            {state.message}
          </p>
          <div className="mt-4">{back}</div>
        </>
      )}
    </section>
  );
}
