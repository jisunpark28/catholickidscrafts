"use client";

import {
  MassSpeakerChildrenIcon,
  MassSpeakerLegend,
  MassSpeakerPriestIcon,
  MassSpeakerRubricIcon,
} from "@/components/mass/MassSpeakerIcons";
import {
  MASS_LITURGY_PARTS,
  MASS_PREVIEW_LINES,
  filterPreviewLines,
  liturgyPartLabel,
  type MassLiturgyPartId,
  type MassParticipationLine,
  type MassSeasonPreset,
  type MassSpeakerRole,
} from "@/lib/mass-participation/preview-script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function roleLabel(role: MassSpeakerRole): string {
  if (role === "priest") return "Priest";
  if (role === "assembly") return "Children";
  return "Direction";
}

function MassLineRow({
  line,
  practiceMode,
  revealed,
  onToggleReveal,
}: {
  line: MassParticipationLine;
  practiceMode: boolean;
  revealed: boolean;
  onToggleReveal: (id: string) => void;
}) {
  const isAssembly = line.role === "assembly";
  const hideText = practiceMode && isAssembly && line.revealable !== false && !revealed;

  return (
    <li className={`mass-line mass-line--${line.role}`} data-line-id={line.id}>
      <div className="mass-line__icon" aria-hidden>
        {line.role === "priest" ? (
          <MassSpeakerPriestIcon size={44} />
        ) : line.role === "assembly" ? (
          <MassSpeakerChildrenIcon size={44} />
        ) : (
          <MassSpeakerRubricIcon size={44} title="Direction" />
        )}
      </div>
      <div className="mass-line__body">
        <div className="mass-line__role">{roleLabel(line.role)}</div>
        <p className={`mass-line__text${hideText ? " mass-line__text--hidden" : ""}`}>
          {line.text}
        </p>
        {hideText && (
          <button
            type="button"
            className="mass-line__reveal"
            onClick={() => onToggleReveal(line.id)}
          >
            Show response
          </button>
        )}
        {practiceMode && isAssembly && revealed && (
          <button
            type="button"
            className="mass-line__reveal"
            onClick={() => onToggleReveal(line.id)}
          >
            Hide again
          </button>
        )}
      </div>
    </li>
  );
}

export function MassParticipationPreview() {
  const pinSentinelRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbarPinned, setToolbarPinned] = useState(false);
  const [toolbarHeight, setToolbarHeight] = useState(0);
  const [season, setSeason] = useState<MassSeasonPreset>("ordinary");
  const [liturgyPart, setLiturgyPart] = useState<MassLiturgyPartId | "all">("all");
  const [practiceMode, setPracticeMode] = useState(true);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const sentinel = pinSentinelRef.current;
    const toolbar = toolbarRef.current;
    if (!sentinel || !toolbar) return;

    const measure = () => setToolbarHeight(toolbar.getBoundingClientRect().height);
    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(toolbar);

    const pinObserver = new IntersectionObserver(
      ([entry]) => setToolbarPinned(!entry.isIntersecting),
      { root: null, threshold: 0, rootMargin: "-60px 0px 0px 0px" },
    );
    pinObserver.observe(sentinel);

    return () => {
      resizeObserver.disconnect();
      pinObserver.disconnect();
    };
  }, []);

  const lines = useMemo(
    () => filterPreviewLines(MASS_PREVIEW_LINES, season, liturgyPart),
    [season, liturgyPart],
  );

  const assemblyIds = useMemo(
    () =>
      lines
        .filter((l) => l.role === "assembly" && l.revealable !== false)
        .map((l) => l.id),
    [lines],
  );

  const toggleReveal = useCallback((id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const showAll = useCallback(() => {
    setRevealedIds(new Set(assemblyIds));
  }, [assemblyIds]);

  const hideAll = useCallback(() => {
    setRevealedIds(new Set());
  }, []);

  const sectionsWithLines = useMemo(() => {
    const parts =
      liturgyPart === "all"
        ? MASS_LITURGY_PARTS
        : MASS_LITURGY_PARTS.filter((p) => p.id === liturgyPart);
    return parts
      .map((section) => ({
        ...section,
        lines: lines.filter((l) => l.section === section.id),
      }))
      .filter((s) => s.lines.length > 0);
  }, [lines, liturgyPart]);

  return (
    <div className="mass-participation">
      <div ref={pinSentinelRef} className="mass-participation__pin-sentinel" aria-hidden />
      <div
        aria-hidden
        className="mass-participation__toolbar-spacer"
        style={toolbarPinned && toolbarHeight > 0 ? { height: toolbarHeight } : undefined}
      />
      <div
        ref={toolbarRef}
        className={`mass-participation__sticky${toolbarPinned ? " mass-participation__sticky--pinned" : ""}`}
      >
        <div className="mass-participation__toolbar">
          <MassSpeakerLegend className="mass-participation__legend" />

          <div className="mass-participation__toolbar-controls">
          <div className="mass-participation__toolbar-group">
            <span className="mass-participation__label">Season</span>
            <select
              className="mass-participation__select"
              value={season}
              onChange={(e) => setSeason(e.target.value as MassSeasonPreset)}
              aria-label="Liturgical season"
            >
              <option value="ordinary">Ordinary Time</option>
              <option value="advent-lent">Advent &amp; Lent</option>
            </select>
          </div>

          <div className="mass-participation__toolbar-group">
            <span className="mass-participation__label">Part</span>
            <select
              className="mass-participation__select mass-participation__select--part"
              value={liturgyPart}
              onChange={(e) =>
                setLiturgyPart(e.target.value as MassLiturgyPartId | "all")
              }
              aria-label="Liturgical part"
            >
              <option value="all">All parts</option>
              {MASS_LITURGY_PARTS.map((part) => (
                <option key={part.id} value={part.id}>
                  {part.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mass-participation__toolbar-group">
            <button
              type="button"
              className={`mass-participation__btn${practiceMode ? " mass-participation__btn--active" : ""}`}
              onClick={() => setPracticeMode(true)}
            >
              Practice
            </button>
            <button
              type="button"
              className={`mass-participation__btn${!practiceMode ? " mass-participation__btn--active" : ""}`}
              onClick={() => {
                setPracticeMode(false);
                showAll();
              }}
            >
              Show all
            </button>
          </div>

          {practiceMode && (
            <div className="mass-participation__toolbar-group">
              <button type="button" className="mass-participation__btn" onClick={showAll}>
                Reveal all responses
              </button>
              <button type="button" className="mass-participation__btn" onClick={hideAll}>
                Hide all responses
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      <div className="mass-participation__body">
        {season === "advent-lent" && (
          <p className="mass-participation__season-note text-sm text-[var(--color-muted)]">
            Gloria is omitted in Advent and Lent, matching your Sunday School projector decks.
          </p>
        )}

        {liturgyPart !== "all" && sectionsWithLines.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]">
            No lines for {liturgyPartLabel(liturgyPart)} in this season.
          </p>
        )}

        {sectionsWithLines.map((section) => (
          <section key={section.id} aria-labelledby={`mass-section-${section.id}`}>
            {liturgyPart === "all" && (
              <h2 id={`mass-section-${section.id}`} className="mass-participation__section-title">
                {section.label}
              </h2>
            )}
            <ul className="flex flex-col gap-2">
              {section.lines.map((line) => (
                <MassLineRow
                  key={line.id}
                  line={line}
                  practiceMode={practiceMode}
                  revealed={revealedIds.has(line.id)}
                  onToggleReveal={toggleReveal}
                />
              ))}
            </ul>
          </section>
        ))}

      </div>
    </div>
  );
}
