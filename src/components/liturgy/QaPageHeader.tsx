import type { PublicQaTopic } from "@/lib/liturgy-qa";
import { fredoka } from "@/components/liturgy/fredoka";

export function QaPageHeader({ topic, eyebrow }: { topic: PublicQaTopic; eyebrow: string }) {
  return (
    <header className={`${fredoka.variable} qa-hero`} style={{ "--qa-accent": topic.accentColor } as React.CSSProperties}>
      <p className="qa-eyebrow">{eyebrow}</p>
      <h1 className="qa-title">{topic.title}</h1>
      {topic.bigIdea && (
        <p className="qa-big">
          <span className="qa-big-label">⭐ Big idea</span>
          {topic.bigIdea}
        </p>
      )}
    </header>
  );
}
