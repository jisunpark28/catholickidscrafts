import type { PublicQaTopic } from "@/lib/liturgy-qa";
import { fredoka } from "@/components/liturgy/fredoka";

export function QaPageHeader({
  topic,
  eyebrow,
  showBigIdeaLabel = true,
}: {
  topic: PublicQaTopic;
  eyebrow?: string;
  showBigIdeaLabel?: boolean;
}) {
  return (
    <header className={`${fredoka.variable} qa-hero`} style={{ "--qa-accent": topic.accentColor } as React.CSSProperties}>
      {eyebrow ? <p className="qa-eyebrow">{eyebrow}</p> : null}
      <h1 className="qa-title">{topic.title}</h1>
      {topic.bigIdea && (
        <p className="qa-big">
          {showBigIdeaLabel ? <span className="qa-big-label">⭐ Big idea</span> : null}
          {topic.bigIdea}
        </p>
      )}
    </header>
  );
}
