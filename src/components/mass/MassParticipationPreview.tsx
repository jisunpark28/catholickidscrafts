"use client";

import {
  MassSpeakerChildrenIcon,
  MassSpeakerLegend,
  MassSpeakerPriestIcon,
  MassSpeakerRubricIcon,
} from "@/components/mass/MassSpeakerIcons";
import {
  MASS_PREVIEW_LINES,
  MASS_PREVIEW_SECTIONS,
  filterPreviewLines,
  type MassParticipationLine,
  type MassSeasonPreset,
  type MassSpeakerRole,
} from "@/lib/mass-participation/preview-script";
import { useCallback, useMemo, useState } from "react";

function roleLabel(role: MassSpeakerRole): string {
  if (role === "priest") return "Priest";
  if (role === "assembly") return "Children & assembly";
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
    <li
      className={`mass-line mass-line--${line.role}`}
      data-line-id={line.id}
    >
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
  const [season, setSeason] = useState<MassSeasonPreset>("ordinary");
  const [practiceMode, setPracticeMode] = useState(true);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set());

  const lines = useMemo(
    () => filterPreviewLines(MASS_PREVIEW_LINES, season),
    [season],
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
    return MASS_PREVIEW_SECTIONS.map((section) => ({
      ...section,
      lines: lines.filter((l) => l.section === section.id),
    })).filter((s) => s.lines.length > 0);
  }, [lines]);

  return (
    <div className="mass-participation">
      <MassSpeakerLegend />

      <div className="mass-participation__toolbar">
        <div className="mass-participation__toolbar-group">
          <span className="mass-participation__label">Season</span>
          <select
            className="mass-participation__select"
            value={season}
            onChange={(e) => setSeason(e.target.value as MassSeasonPreset)}
            aria-label="Liturgical season"
          >
            <option value="ordinary">Ordinary Time / Easter</option>
            <option value="advent-lent">Advent &amp; Lent (no Gloria)</option>
            <option value="easter">Easter (same as Ordinary here)</option>
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

      {season === "advent-lent" && (
        <p className="text-sm text-[var(--color-muted)]">
          Gloria slides are skipped in Advent and Lent, matching your Sunday School projector decks.
        </p>
      )}

      {sectionsWithLines.map((section) => (
        <section key={section.id} aria-labelledby={`mass-section-${section.id}`}>
          <h2 id={`mass-section-${section.id}`} className="mass-participation__section-title">
            {section.label}
          </h2>
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

      <p className="mass-participation__copyright">
        Preview based on St. Andrew Kim Catholic Church Sunday School projector flow (2025–2026).
        Excerpts from the English translation of The Roman Missal © 2010, International
        Commission on English in the Liturgy Corporation. All rights reserved.
      </p>
    </div>
  );
}
