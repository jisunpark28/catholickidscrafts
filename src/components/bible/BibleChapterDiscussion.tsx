"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type DiscussionComment = {
  id: string;
  body: string;
  authorDisplay: string;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canDelete: boolean;
};

type DiscussionThread = {
  id: string;
  body: string;
  authorDisplay: string;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canDelete: boolean;
  comments: DiscussionComment[];
};

type DiscussionViewer = {
  canWrite: boolean;
  penName: string | null;
  needsPenName: boolean;
  canModerate: boolean;
  readerType: "owner" | "sub" | null;
};

type Props = {
  bookSlug: string;
  chapter: number;
  initialSignedIn: boolean;
  initialReaderLabel: string;
};

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return {} as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(res.ok ? "Invalid server response" : `Request failed (${res.status})`);
  }
}

function apiErrorMessage(
  res: Response,
  data: { error?: string } | null,
  fallback: string,
): string {
  if (data?.error) return data.error;
  if (res.status === 401) {
    return "Sign in with a family account or Access ID to comment.";
  }
  if (res.status === 403) {
    return "You can only edit or delete your own comments.";
  }
  return `${fallback} (${res.status})`;
}

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

function Avatar() {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dfc9b0] text-sm font-bold text-[var(--color-ink)]"
      aria-hidden
    >
      <span className="sr-only">Comment</span>
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current opacity-70" aria-hidden>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
}

export function BibleChapterDiscussion({
  bookSlug,
  chapter,
  initialSignedIn,
  initialReaderLabel,
}: Props) {
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [viewer, setViewer] = useState<DiscussionViewer>({
    canWrite: initialSignedIn,
    penName: initialSignedIn ? initialReaderLabel : null,
    needsPenName: false,
    canModerate: false,
    readerType: null,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [newThreadBody, setNewThreadBody] = useState("");
  const [replyBodies, setReplyBodies] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const loadGeneration = useRef(0);

  const canCompose = viewerReady ? viewer.canWrite : initialSignedIn;

  const commentCount = useMemo(
    () => threads.reduce((sum, thread) => sum + 1 + thread.comments.length, 0),
    [threads],
  );

  const loadDiscussion = useCallback(async () => {
    const generation = ++loadGeneration.current;
    setLoading(true);
    setLoadError(null);
    try {
      const discussionRes = await fetch(
        `/api/bible/discussion?bookSlug=${encodeURIComponent(bookSlug)}&chapter=${chapter}`,
        { cache: "no-store", credentials: "include" },
      );

      if (generation !== loadGeneration.current) return;

      const data = await readJson<{
        threads?: DiscussionThread[];
        viewer?: DiscussionViewer;
        error?: string;
      }>(discussionRes);

      if (generation !== loadGeneration.current) return;

      if (!discussionRes.ok) {
        setLoadError(data.error ?? "Could not load comments. Please try again.");
        return;
      }

      if (data.viewer) {
        setViewer(data.viewer);
      }
      setViewerReady(true);
      if (discussionRes.ok) setThreads(data.threads ?? []);
    } catch {
      setLoadError("Could not load comments. Please try again.");
    } finally {
      if (generation === loadGeneration.current) {
        setLoading(false);
      }
    }
  }, [bookSlug, chapter]);

  useEffect(() => {
    void loadDiscussion();
  }, [loadDiscussion]);

  const postThread = async () => {
    const body = newThreadBody.trim();
    if (!body || submitting) return;

    const optimisticId = `pending-${Date.now()}`;
    const optimisticThread: DiscussionThread = {
      id: optimisticId,
      body,
      authorDisplay: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      canEdit: false,
      canDelete: false,
      comments: [],
    };

    setSubmitting(true);
    setActionError(null);
    setNewThreadBody("");
    setThreads((prev) => [...prev, optimisticThread]);

    try {
      const res = await fetch("/api/bible/discussion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookSlug, chapter, body }),
      });
      const data = await readJson<{ thread?: DiscussionThread; error?: string }>(res);
      if (res.ok && data.thread) {
        setThreads((prev) =>
          prev.map((thread) => (thread.id === optimisticId ? data.thread! : thread)),
        );
      } else {
        setThreads((prev) => prev.filter((thread) => thread.id !== optimisticId));
        setNewThreadBody(body);
        setActionError(apiErrorMessage(res, data, "Could not post comment"));
      }
    } catch {
      setThreads((prev) => prev.filter((thread) => thread.id !== optimisticId));
      setNewThreadBody(body);
      setActionError("Could not post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const postReply = async (threadId: string) => {
    const body = (replyBodies[threadId] ?? "").trim();
    if (!body || submitting) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/bible/discussion/${threadId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body }),
      });
      const data = await readJson<{ comment?: DiscussionComment; error?: string }>(res);
      if (res.ok && data.comment) {
        const comment = data.comment;
        setReplyBodies((prev) => ({ ...prev, [threadId]: "" }));
        setReplyingTo(null);
        setExpandedReplies((prev) => ({ ...prev, [threadId]: true }));
        setThreads((prev) =>
          prev.map((thread) => {
            if (thread.id !== threadId) return thread;
            if (thread.comments.some((item) => item.id === comment.id)) {
              return {
                ...thread,
                comments: thread.comments.map((item) =>
                  item.id === comment.id ? comment : item,
                ),
              };
            }
            return { ...thread, comments: [...thread.comments, comment] };
          }),
        );
      } else {
        setActionError(apiErrorMessage(res, data, "Could not post reply"));
      }
    } catch {
      setActionError("Could not post reply. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveThreadEdit = async (threadId: string) => {
    const body = editDraft.trim();
    if (!body || submitting || threadId.startsWith("pending-")) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/bible/discussion/${threadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body }),
      });
      const data = await readJson<{
        thread?: { id: string; body: string; updatedAt: string };
        error?: string;
      }>(res);
      if (!res.ok || !data.thread) {
        setActionError(apiErrorMessage(res, data, "Could not save comment"));
        return;
      }
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? { ...thread, body: data.thread!.body, updatedAt: data.thread!.updatedAt }
            : thread,
        ),
      );
      setEditingThreadId(null);
      setEditDraft("");
    } catch {
      setActionError("Could not save comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveCommentEdit = async (commentId: string, threadId: string) => {
    const body = editDraft.trim();
    if (!body || submitting) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/bible/discussion/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body }),
      });
      const data = await readJson<{
        comment?: { id: string; body: string; updatedAt: string };
        error?: string;
      }>(res);
      if (!res.ok || !data.comment) {
        setActionError(apiErrorMessage(res, data, "Could not save reply"));
        return;
      }
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                comments: thread.comments.map((comment) =>
                  comment.id === commentId
                    ? {
                        ...comment,
                        body: data.comment!.body,
                        updatedAt: data.comment!.updatedAt,
                      }
                    : comment,
                ),
              }
            : thread,
        ),
      );
      setEditingCommentId(null);
      setEditDraft("");
    } catch {
      setActionError("Could not save reply. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteThread = async (threadId: string) => {
    if (submitting || !window.confirm("Delete this comment and all replies?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bible/discussion/${threadId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await readJson<{ error?: string }>(res).catch(() => ({}));
        setActionError(apiErrorMessage(res, data, "Could not delete comment"));
        return;
      }
      setThreads((prev) => prev.filter((thread) => thread.id !== threadId));
    } catch {
      // No user-facing error.
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string, threadId: string) => {
    if (submitting || !window.confirm("Delete this reply?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bible/discussion/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await readJson<{ error?: string }>(res).catch(() => ({}));
        setActionError(apiErrorMessage(res, data, "Could not delete reply"));
        return;
      }
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                comments: thread.comments.filter((comment) => comment.id !== commentId),
              }
            : thread,
        ),
      );
    } catch {
      // No user-facing error.
    } finally {
      setSubmitting(false);
    }
  };

  function renderCommentActions(
    canEdit: boolean,
    canDelete: boolean,
    onEdit: () => void,
    onDelete: () => void,
  ) {
    if (!canEdit && !canDelete) return null;
    return (
      <span className="ml-2 inline-flex gap-2 text-xs text-[var(--color-muted)]">
        {canEdit ? (
          <button type="button" className="hover:text-[var(--color-ink)]" onClick={onEdit}>
            Edit
          </button>
        ) : null}
        {canDelete ? (
          <button type="button" className="hover:text-red-700" onClick={onDelete}>
            Delete
          </button>
        ) : null}
      </span>
    );
  }

  return (
    <section className="mt-8 space-y-4 border-t border-[#e8e0d6] pt-6">
      <h2 className="text-base font-semibold text-[var(--color-ink)]">
        {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
      </h2>

      {canCompose ? (
        <div className="flex gap-3">
          <Avatar />
          <div className="min-w-0 flex-1 space-y-2">
            <textarea
              rows={2}
              maxLength={2000}
              placeholder="Add a comment…"
              className="w-full resize-none border-0 border-b border-[#e8e0d6] bg-transparent pb-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:border-[#cfc4b8] focus:outline-none"
              value={newThreadBody}
              onChange={(e) => setNewThreadBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  void postThread();
                }
              }}
            />
            <div className="flex justify-end">
              <button
                type="button"
                className="rounded-full bg-[var(--color-accent)] px-4 py-1 text-xs font-bold text-white disabled:opacity-40"
                disabled={submitting || !newThreadBody.trim()}
                onClick={() => void postThread()}
              >
                {submitting ? "…" : "Comment"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--color-muted)]">
          <Link href="/account/login" className="font-semibold text-[var(--color-link)]">
            Sign in
          </Link>{" "}
          or{" "}
          <Link href="/reader/login" className="font-semibold text-[var(--color-link)]">
            Access ID
          </Link>{" "}
          to comment.
        </p>
      )}

      {actionError ? (
        <p className="text-sm text-red-700" role="alert">
          {actionError}{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => setActionError(null)}
          >
            Dismiss
          </button>
        </p>
      ) : null}

      {loadError ? (
        <p className="text-sm text-red-700" role="alert">
          {loadError}{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => void loadDiscussion()}
          >
            Retry
          </button>
        </p>
      ) : null}

      {loading ? <p className="text-sm text-[var(--color-muted)]">Loading…</p> : null}

      <ul className="space-y-5">
        {threads.map((thread) => {
          const repliesOpen = expandedReplies[thread.id] ?? false;
          return (
            <li key={thread.id}>
              <div className="flex gap-3">
                <Avatar />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="text-xs text-[var(--color-muted)]">
                      {formatWhen(thread.createdAt)}
                    </span>
                    {thread.canEdit || thread.canDelete
                      ? renderCommentActions(
                          thread.canEdit,
                          thread.canDelete,
                          () => {
                            setEditingThreadId(thread.id);
                            setEditingCommentId(null);
                            setEditDraft(thread.body);
                          },
                          () => void deleteThread(thread.id),
                        )
                      : null}
                  </p>
                  {editingThreadId === thread.id ? (
                    <div className="mt-1 space-y-2">
                      <textarea
                        rows={2}
                        maxLength={2000}
                        className="w-full resize-y rounded-lg border border-[#e8e0d6] px-2 py-1 text-sm"
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="text-xs font-semibold text-[var(--color-accent)]"
                          disabled={submitting || !editDraft.trim()}
                          onClick={() => void saveThreadEdit(thread.id)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="text-xs text-[var(--color-muted)]"
                          onClick={() => {
                            setEditingThreadId(null);
                            setEditDraft("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-ink)]">
                      {thread.body}
                    </p>
                  )}

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-[var(--color-muted)]">
                    {canCompose ? (
                      <button
                        type="button"
                        className="hover:text-[var(--color-ink)]"
                        onClick={() =>
                          setReplyingTo((prev) => (prev === thread.id ? null : thread.id))
                        }
                      >
                        Reply
                      </button>
                    ) : null}
                    {thread.comments.length > 0 ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-[var(--color-ink)]"
                        onClick={() =>
                          setExpandedReplies((prev) => ({
                            ...prev,
                            [thread.id]: !repliesOpen,
                          }))
                        }
                      >
                        <span aria-hidden>{repliesOpen ? "▾" : "▸"}</span>
                        {thread.comments.length}{" "}
                        {thread.comments.length === 1 ? "reply" : "replies"}
                      </button>
                    ) : null}
                  </div>

                  {replyingTo === thread.id && canCompose ? (
                    <div className="mt-3 flex gap-3">
                      <Avatar />
                      <div className="min-w-0 flex-1 space-y-2">
                        <textarea
                          rows={2}
                          maxLength={2000}
                          autoFocus
                          placeholder="Add a reply…"
                          className="w-full resize-none border-0 border-b border-[#e8e0d6] bg-transparent pb-2 text-sm focus:border-[#cfc4b8] focus:outline-none"
                          value={replyBodies[thread.id] ?? ""}
                          onChange={(e) =>
                            setReplyBodies((prev) => ({ ...prev, [thread.id]: e.target.value }))
                          }
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="text-xs text-[var(--color-muted)]"
                            onClick={() => setReplyingTo(null)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="rounded-full bg-[var(--color-accent)] px-3 py-1 text-xs font-bold text-white disabled:opacity-40"
                            disabled={submitting || !(replyBodies[thread.id] ?? "").trim()}
                            onClick={() => void postReply(thread.id)}
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {repliesOpen && thread.comments.length > 0 ? (
                    <ul className="mt-3 space-y-4 pl-3 sm:pl-6">
                      {thread.comments.map((comment) => (
                        <li key={comment.id} className="flex gap-3">
                          <Avatar />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm">
                              <span className="text-xs text-[var(--color-muted)]">
                                {formatWhen(comment.createdAt)}
                              </span>
                              {comment.canEdit || comment.canDelete
                                ? renderCommentActions(
                                    comment.canEdit,
                                    comment.canDelete,
                                    () => {
                                      setEditingCommentId(comment.id);
                                      setEditingThreadId(null);
                                      setEditDraft(comment.body);
                                    },
                                    () => void deleteComment(comment.id, thread.id),
                                  )
                                : null}
                            </p>
                            {editingCommentId === comment.id ? (
                              <div className="mt-1 space-y-2">
                                <textarea
                                  rows={2}
                                  maxLength={2000}
                                  className="w-full resize-y rounded-lg border border-[#e8e0d6] px-2 py-1 text-sm"
                                  value={editDraft}
                                  onChange={(e) => setEditDraft(e.target.value)}
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    className="text-xs font-semibold text-[var(--color-accent)]"
                                    disabled={submitting || !editDraft.trim()}
                                    onClick={() => void saveCommentEdit(comment.id, thread.id)}
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    className="text-xs text-[var(--color-muted)]"
                                    onClick={() => {
                                      setEditingCommentId(null);
                                      setEditDraft("");
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-ink)]">
                                {comment.body}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
