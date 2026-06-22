"use client";

import {
  isHeaderSignedIn,
  type HeaderSessionResponse,
} from "@/lib/header-session";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

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

function avatarInitial(label: string): string {
  const ch = label.trim().charAt(0);
  return ch ? ch.toUpperCase() : "?";
}

function Avatar({ label }: { label: string }) {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dfc9b0] text-sm font-bold text-[var(--color-ink)]"
      aria-hidden
    >
      {avatarInitial(label)}
    </div>
  );
}

function readerLabelFromSession(session: HeaderSessionResponse | null): string {
  if (!session) return "?";
  if (session.reader?.displayName) return session.reader.displayName;
  if (session.family?.displayName?.trim()) return session.family.displayName.trim();
  if (session.family?.email) return session.family.email.split("@")[0] ?? "?";
  return "?";
}

export function BibleChapterDiscussion({
  bookSlug,
  chapter,
  initialSignedIn,
  initialReaderLabel,
}: Props) {
  const [session, setSession] = useState<HeaderSessionResponse | null>(null);
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [viewer, setViewer] = useState<DiscussionViewer>({
    canWrite: initialSignedIn,
    penName: initialSignedIn ? initialReaderLabel : null,
    needsPenName: false,
    canModerate: false,
    readerType: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newThreadBody, setNewThreadBody] = useState("");
  const [replyBodies, setReplyBodies] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);

  const signedIn = session ? isHeaderSignedIn(session) : initialSignedIn;
  const readerLabel = session ? readerLabelFromSession(session) : initialReaderLabel;
  const canCompose = signedIn || viewer.canWrite;

  const commentCount = useMemo(
    () => threads.reduce((sum, thread) => sum + 1 + thread.comments.length, 0),
    [threads],
  );

  const loadDiscussion = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const [sessionRes, discussionRes] = await Promise.all([
        fetch("/api/auth/session", { cache: "no-store" }),
        fetch(
          `/api/bible/discussion?bookSlug=${encodeURIComponent(bookSlug)}&chapter=${chapter}`,
          { cache: "no-store" },
        ),
      ]);

      if (sessionRes.ok) {
        const sessionData = await readJson<HeaderSessionResponse>(sessionRes);
        setSession(sessionData);
      }

      const data = await readJson<{
        threads?: DiscussionThread[];
        viewer?: DiscussionViewer;
        error?: string;
      }>(discussionRes);

      if (data.viewer) setViewer(data.viewer);
      setThreads(data.threads ?? []);

      if (!discussionRes.ok && !data.threads) {
        throw new Error(data.error ?? "Could not load comments");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load comments");
    } finally {
      setLoading(false);
    }
  }, [bookSlug, chapter]);

  useEffect(() => {
    void loadDiscussion();
  }, [loadDiscussion]);

  const postThread = async () => {
    const body = newThreadBody.trim();
    if (!body || submitting || !canCompose) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/bible/discussion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookSlug, chapter, body }),
      });
      const data = await readJson<{ thread?: DiscussionThread; error?: string }>(res);
      if (!res.ok || !data.thread) throw new Error(data.error ?? "Could not post");
      setThreads((prev) => [...prev, data.thread!]);
      setNewThreadBody("");
      setComposerOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not post");
    } finally {
      setSubmitting(false);
    }
  };

  const postReply = async (threadId: string) => {
    const body = (replyBodies[threadId] ?? "").trim();
    if (!body || submitting || !canCompose) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/bible/discussion/${threadId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await readJson<{ comment?: DiscussionComment; error?: string }>(res);
      if (!res.ok || !data.comment) throw new Error(data.error ?? "Could not reply");
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? { ...thread, comments: [...thread.comments, data.comment!] }
            : thread,
        ),
      );
      setReplyBodies((prev) => ({ ...prev, [threadId]: "" }));
      setReplyingTo(null);
      setExpandedReplies((prev) => ({ ...prev, [threadId]: true }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reply");
    } finally {
      setSubmitting(false);
    }
  };

  const saveThreadEdit = async (threadId: string) => {
    const body = editDraft.trim();
    if (!body || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/bible/discussion/${threadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await readJson<{
        thread?: { id: string; body: string; updatedAt: string };
        error?: string;
      }>(res);
      if (!res.ok || !data.thread) throw new Error(data.error ?? "Could not update");
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? { ...thread, body: data.thread!.body, updatedAt: data.thread!.updatedAt }
            : thread,
        ),
      );
      setEditingThreadId(null);
      setEditDraft("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update");
    } finally {
      setSubmitting(false);
    }
  };

  const saveCommentEdit = async (commentId: string, threadId: string) => {
    const body = editDraft.trim();
    if (!body || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/bible/discussion/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await readJson<{
        comment?: { id: string; body: string; updatedAt: string };
        error?: string;
      }>(res);
      if (!res.ok || !data.comment) throw new Error(data.error ?? "Could not update");
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteThread = async (threadId: string) => {
    if (submitting || !window.confirm("Delete this comment and all replies?")) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/bible/discussion/${threadId}`, { method: "DELETE" });
      const data = await readJson<{ error?: string }>(res);
      if (!res.ok) throw new Error(data.error ?? "Could not delete");
      setThreads((prev) => prev.filter((thread) => thread.id !== threadId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string, threadId: string) => {
    if (submitting || !window.confirm("Delete this reply?")) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/bible/discussion/comments/${commentId}`, {
        method: "DELETE",
      });
      const data = await readJson<{ error?: string }>(res);
      if (!res.ok) throw new Error(data.error ?? "Could not delete");
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete");
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
          <Avatar label={viewer.penName ?? readerLabel} />
          <div className="min-w-0 flex-1">
            {!composerOpen ? (
              <button
                type="button"
                className="w-full border-b border-[#e8e0d6] pb-2 text-left text-sm text-[var(--color-muted)] hover:border-[#cfc4b8]"
                onClick={() => setComposerOpen(true)}
              >
                Add a comment…
              </button>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  maxLength={2000}
                  autoFocus
                  placeholder="Add a comment…"
                  className="w-full resize-none border-0 border-b border-[#e8e0d6] bg-transparent pb-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:border-[#cfc4b8] focus:outline-none"
                  value={newThreadBody}
                  onChange={(e) => setNewThreadBody(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-full px-3 py-1 text-xs font-semibold text-[var(--color-muted)] hover:bg-[#f5ebe0]"
                    onClick={() => {
                      setComposerOpen(false);
                      setNewThreadBody("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-[var(--color-accent)] px-4 py-1 text-xs font-bold text-white disabled:opacity-40"
                    disabled={submitting || !newThreadBody.trim()}
                    onClick={() => void postThread()}
                  >
                    Comment
                  </button>
                </div>
              </div>
            )}
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

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {loading ? <p className="text-sm text-[var(--color-muted)]">Loading…</p> : null}

      <ul className="space-y-5">
        {threads.map((thread) => {
          const repliesOpen = expandedReplies[thread.id] ?? false;
          return (
            <li key={thread.id}>
              <div className="flex gap-3">
                <Avatar label={thread.authorDisplay} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold text-[var(--color-ink)]">
                      {thread.authorDisplay}
                    </span>
                    <span className="ml-2 text-xs text-[var(--color-muted)]">
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
                      <Avatar label={viewer.penName ?? readerLabel} />
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
                          <Avatar label={comment.authorDisplay} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm">
                              <span className="font-semibold">{comment.authorDisplay}</span>
                              <span className="ml-2 text-xs text-[var(--color-muted)]">
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
