"use client";

import type { LessonKitCommentDto } from "@/lib/lesson-kit/comments";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  kitId: string;
  shareSlug: string;
  signedIn: boolean;
};

type CommentTreeNode = LessonKitCommentDto & {
  replies: CommentTreeNode[];
};

function formatWhen(iso: string): string {
  try {
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function buildCommentTree(comments: LessonKitCommentDto[]): CommentTreeNode[] {
  const nodes = new Map<string, CommentTreeNode>();
  for (const comment of comments) {
    nodes.set(comment.id, { ...comment, replies: [] });
  }

  const roots: CommentTreeNode[] = [];
  for (const comment of comments) {
    const node = nodes.get(comment.id);
    if (!node) continue;
    if (comment.parentId && nodes.has(comment.parentId)) {
      nodes.get(comment.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

type CommentFormProps = {
  kitId: string;
  parentId?: string | null;
  placeholder: string;
  submitLabel: string;
  onPosted: (comment: LessonKitCommentDto) => void;
  onCancel?: () => void;
};

function CommentForm({
  kitId,
  parentId = null,
  placeholder,
  submitLabel,
  onPosted,
  onCancel,
}: CommentFormProps) {
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Write a comment first.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/program/kits/${kitId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: trimmed,
          parentId,
          authorName: authorName.trim() || undefined,
        }),
      });
      const json = (await res.json()) as { comment?: LessonKitCommentDto; error?: string };
      if (!res.ok || !json.comment) {
        setError(json.error ?? "Could not post comment.");
        return;
      }
      setBody("");
      setAuthorName("");
      onPosted(json.comment);
      onCancel?.();
    } catch {
      setError("Could not post comment.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm text-[var(--color-ink)]">
        <span className="sr-only">Your comment</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={parentId ? 3 : 4}
          placeholder={placeholder}
          className="w-full resize-y border border-[var(--color-border)] px-3 py-2 text-sm"
          disabled={pending}
        />
      </label>
      {!parentId ? (
        <label className="block text-sm text-[var(--color-ink)]">
          <span className="font-semibold">Display name (optional)</span>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="e.g. Mrs. Lopez"
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-sm"
            disabled={pending}
          />
        </label>
      ) : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => void submit()}
          className="lesson-big-button lesson-big-button--secondary px-4 py-2 text-sm"
        >
          {pending ? "Posting…" : submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            disabled={pending}
            onClick={onCancel}
            className="text-sm font-semibold text-[var(--color-link)]"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
}

type CommentItemProps = {
  node: CommentTreeNode;
  kitId: string;
  signedIn: boolean;
  onPosted: (comment: LessonKitCommentDto) => void;
  depth?: number;
};

function CommentItem({ node, kitId, signedIn, onPosted, depth = 0 }: CommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false);

  return (
    <li className={depth > 0 ? "mt-3 border-l-2 border-[#e8e0d6] pl-4" : ""}>
      <article className="rounded border border-[var(--color-border)] bg-white p-4">
        <header className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
          <span className="font-bold text-[var(--color-ink)]">{node.authorName}</span>
          {node.isMine ? (
            <span className="rounded bg-[#f0ebe3] px-1.5 py-0.5 text-xs font-semibold text-[var(--color-muted)]">
              You
            </span>
          ) : null}
          <time className="text-xs text-[var(--color-muted)]" dateTime={node.createdAt}>
            {formatWhen(node.createdAt)}
          </time>
        </header>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-ink)]">{node.body}</p>
        {signedIn ? (
          <button
            type="button"
            onClick={() => setReplyOpen((open) => !open)}
            className="mt-3 text-sm font-semibold text-[var(--color-link)]"
          >
            {replyOpen ? "Hide reply" : "Reply"}
          </button>
        ) : null}
        {replyOpen ? (
          <div className="mt-3 border-t border-[var(--color-border)] pt-3">
            <CommentForm
              kitId={kitId}
              parentId={node.id}
              placeholder="Write a reply…"
              submitLabel="Post reply"
              onPosted={onPosted}
              onCancel={() => setReplyOpen(false)}
            />
          </div>
        ) : null}
      </article>
      {node.replies.length > 0 ? (
        <ul className="mt-3 space-y-0">
          {node.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              node={reply}
              kitId={kitId}
              signedIn={signedIn}
              onPosted={onPosted}
              depth={depth + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function CommunityLessonComments({ kitId, shareSlug, signedIn }: Props) {
  const [comments, setComments] = useState<LessonKitCommentDto[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loginHref = `/account/login?next=${encodeURIComponent(`/program/community/${shareSlug}`)}`;

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/program/kits/${kitId}/comments`);
      const json = (await res.json()) as { comments?: LessonKitCommentDto[]; error?: string };
      if (!res.ok) {
        setLoadError(json.error ?? "Could not load comments.");
        return;
      }
      setComments(json.comments ?? []);
      setLoadError(null);
    } catch {
      setLoadError("Could not load comments.");
    } finally {
      setLoaded(true);
    }
  }, [kitId]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const tree = useMemo(() => buildCommentTree(comments), [comments]);

  const onPosted = (comment: LessonKitCommentDto) => {
    setComments((prev) => [...prev, comment]);
  };

  return (
    <section className="border-t border-[var(--color-border)] pt-8">
      <h2 className="mb-2 text-xl font-bold text-[var(--color-ink)]">Feedback &amp; questions</h2>
      <p className="mb-6 text-sm text-[var(--color-muted)]">
        Ask the author or share how you used this lesson with your class.
      </p>

      {signedIn ? (
        <div className="mb-8 rounded border border-[var(--color-border)] bg-[#fffaf5] p-4">
          <CommentForm
            kitId={kitId}
            placeholder="Share feedback or ask a question…"
            submitLabel="Post comment"
            onPosted={onPosted}
          />
        </div>
      ) : (
        <p className="mb-8 text-sm text-[var(--color-muted)]">
          <Link href={loginHref} className="font-semibold text-[var(--color-link)]">
            Sign in
          </Link>{" "}
          to leave feedback or ask a question.
        </p>
      )}

      {!loaded ? (
        <p className="text-sm text-[var(--color-muted)]">Loading comments…</p>
      ) : loadError ? (
        <p className="text-sm text-red-700">{loadError}</p>
      ) : tree.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">No comments yet. Be the first to share feedback.</p>
      ) : (
        <ul className="space-y-4">
          {tree.map((node) => (
            <CommentItem
              key={node.id}
              node={node}
              kitId={kitId}
              signedIn={signedIn}
              onPosted={onPosted}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
