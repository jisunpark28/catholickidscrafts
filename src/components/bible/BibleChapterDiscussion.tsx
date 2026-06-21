"use client";

import { HOME_HUB_PANEL_CLASS } from "@/components/HomeHubButton";
import { useCallback, useEffect, useState } from "react";

type DiscussionComment = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canDelete: boolean;
};

type DiscussionThread = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canDelete: boolean;
  comments: DiscussionComment[];
};

type Props = {
  bookSlug: string;
  chapter: number;
};

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function textAreaClass() {
  return "w-full resize-y rounded-xl border border-[#e8e0d6] bg-white px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:border-[#dfc9b0] focus:outline-none focus:ring-1 focus:ring-[#dfc9b0]";
}

function actionButtonClass(kind: "primary" | "ghost" | "danger" = "ghost") {
  if (kind === "primary") {
    return "rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-40";
  }
  if (kind === "danger") {
    return "rounded-lg px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50";
  }
  return "rounded-lg px-2 py-1 text-xs font-semibold text-[var(--color-muted)] hover:bg-[#f5ebe0]";
}

export function BibleChapterDiscussion({ bookSlug, chapter }: Props) {
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [canModerate, setCanModerate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newThreadBody, setNewThreadBody] = useState("");
  const [replyBodies, setReplyBodies] = useState<Record<string, string>>({});
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadDiscussion = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `/api/bible/discussion?bookSlug=${encodeURIComponent(bookSlug)}&chapter=${chapter}`,
      );
      const data = (await res.json()) as {
        threads?: DiscussionThread[];
        canModerate?: boolean;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Could not load discussion");
      setThreads(data.threads ?? []);
      setCanModerate(Boolean(data.canModerate));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load discussion");
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, [bookSlug, chapter]);

  useEffect(() => {
    void loadDiscussion();
  }, [loadDiscussion]);

  const postThread = async () => {
    const body = newThreadBody.trim();
    if (!body || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/bible/discussion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookSlug, chapter, body }),
      });
      const data = (await res.json()) as { thread?: DiscussionThread; error?: string };
      if (!res.ok || !data.thread) throw new Error(data.error ?? "Could not post");
      setThreads((prev) => [...prev, data.thread!]);
      setNewThreadBody("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not post");
    } finally {
      setSubmitting(false);
    }
  };

  const postReply = async (threadId: string) => {
    const body = (replyBodies[threadId] ?? "").trim();
    if (!body || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/bible/discussion/${threadId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = (await res.json()) as { comment?: DiscussionComment; error?: string };
      if (!res.ok || !data.comment) throw new Error(data.error ?? "Could not reply");
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? { ...thread, comments: [...thread.comments, data.comment!] }
            : thread,
        ),
      );
      setReplyBodies((prev) => ({ ...prev, [threadId]: "" }));
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
      const data = (await res.json()) as {
        thread?: { id: string; body: string; updatedAt: string };
        error?: string;
      };
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
      const data = (await res.json()) as {
        comment?: { id: string; body: string; updatedAt: string };
        error?: string;
      };
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
    if (submitting) return;
    if (!window.confirm("Delete this post and all replies?")) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/bible/discussion/${threadId}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not delete");
      setThreads((prev) => prev.filter((thread) => thread.id !== threadId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string, threadId: string) => {
    if (submitting) return;
    if (!window.confirm("Delete this reply?")) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/bible/discussion/comments/${commentId}`, {
        method: "DELETE",
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
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

  return (
    <section className={`${HOME_HUB_PANEL_CLASS} space-y-4 bg-white`}>
      <div>
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">
          Questions &amp; thoughts
        </h2>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Anonymous posts. You can edit or delete your own posts on this device.
          {canModerate ? " Operator: you can moderate all posts." : null}
        </p>
      </div>

      <div className="space-y-2">
        <label className="sr-only" htmlFor={`discussion-new-${bookSlug}-${chapter}`}>
          Share a question or thought
        </label>
        <textarea
          id={`discussion-new-${bookSlug}-${chapter}`}
          rows={3}
          maxLength={2000}
          placeholder="Share a question or thought about this chapter…"
          className={textAreaClass()}
          value={newThreadBody}
          onChange={(e) => setNewThreadBody(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            type="button"
            className={actionButtonClass("primary")}
            disabled={submitting || !newThreadBody.trim()}
            onClick={() => void postThread()}
          >
            Post
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--color-muted)]">Loading discussion…</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && threads.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">No posts yet. Be the first to share.</p>
      ) : null}

      <ul className="space-y-4">
        {threads.map((thread) => (
          <li
            key={thread.id}
            className="rounded-xl border border-[#e8e0d6] bg-[#faf8f5] p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
                  Anonymous · {formatWhen(thread.createdAt)}
                  {thread.updatedAt !== thread.createdAt ? " · edited" : ""}
                </p>
                {editingThreadId === thread.id ? (
                  <textarea
                    rows={3}
                    maxLength={2000}
                    className={`${textAreaClass()} mt-2`}
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                  />
                ) : (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--color-ink)]">
                    {thread.body}
                  </p>
                )}
              </div>
              {thread.canEdit || thread.canDelete ? (
                <div className="flex shrink-0 gap-1">
                  {editingThreadId === thread.id ? (
                    <>
                      <button
                        type="button"
                        className={actionButtonClass("primary")}
                        disabled={submitting || !editDraft.trim()}
                        onClick={() => void saveThreadEdit(thread.id)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className={actionButtonClass()}
                        onClick={() => {
                          setEditingThreadId(null);
                          setEditDraft("");
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      {thread.canEdit ? (
                        <button
                          type="button"
                          className={actionButtonClass()}
                          onClick={() => {
                            setEditingThreadId(thread.id);
                            setEditingCommentId(null);
                            setEditDraft(thread.body);
                          }}
                        >
                          Edit
                        </button>
                      ) : null}
                      {thread.canDelete ? (
                        <button
                          type="button"
                          className={actionButtonClass("danger")}
                          onClick={() => void deleteThread(thread.id)}
                        >
                          Delete
                        </button>
                      ) : null}
                    </>
                  )}
                </div>
              ) : null}
            </div>

            {thread.comments.length > 0 ? (
              <ul className="mt-3 space-y-2 border-t border-[#e8e0d6] pt-3">
                {thread.comments.map((comment) => (
                  <li key={comment.id} className="rounded-lg bg-white px-3 py-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
                          Anonymous · {formatWhen(comment.createdAt)}
                          {comment.updatedAt !== comment.createdAt ? " · edited" : ""}
                        </p>
                        {editingCommentId === comment.id ? (
                          <textarea
                            rows={2}
                            maxLength={2000}
                            className={`${textAreaClass()} mt-2`}
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                          />
                        ) : (
                          <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-ink)]">
                            {comment.body}
                          </p>
                        )}
                      </div>
                      {comment.canEdit || comment.canDelete ? (
                        <div className="flex shrink-0 gap-1">
                          {editingCommentId === comment.id ? (
                            <>
                              <button
                                type="button"
                                className={actionButtonClass("primary")}
                                disabled={submitting || !editDraft.trim()}
                                onClick={() => void saveCommentEdit(comment.id, thread.id)}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className={actionButtonClass()}
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditDraft("");
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              {comment.canEdit ? (
                                <button
                                  type="button"
                                  className={actionButtonClass()}
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditingThreadId(null);
                                    setEditDraft(comment.body);
                                  }}
                                >
                                  Edit
                                </button>
                              ) : null}
                              {comment.canDelete ? (
                                <button
                                  type="button"
                                  className={actionButtonClass("danger")}
                                  onClick={() => void deleteComment(comment.id, thread.id)}
                                >
                                  Delete
                                </button>
                              ) : null}
                            </>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-3 space-y-2 border-t border-[#e8e0d6] pt-3">
              <label className="sr-only" htmlFor={`reply-${thread.id}`}>
                Reply to post
              </label>
              <textarea
                id={`reply-${thread.id}`}
                rows={2}
                maxLength={2000}
                placeholder="Write a reply…"
                className={textAreaClass()}
                value={replyBodies[thread.id] ?? ""}
                onChange={(e) =>
                  setReplyBodies((prev) => ({ ...prev, [thread.id]: e.target.value }))
                }
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  className={actionButtonClass("primary")}
                  disabled={submitting || !(replyBodies[thread.id] ?? "").trim()}
                  onClick={() => void postReply(thread.id)}
                >
                  Reply
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
