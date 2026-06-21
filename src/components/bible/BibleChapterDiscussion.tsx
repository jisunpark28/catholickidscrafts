"use client";

import { HOME_HUB_PANEL_CLASS } from "@/components/HomeHubButton";
import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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
  const copy = useSiteCopy();
  const t = (key: string, fallback: string) => textFromCopy(copy, key, fallback);

  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [viewer, setViewer] = useState<DiscussionViewer>({
    canWrite: false,
    penName: null,
    needsPenName: false,
    canModerate: false,
    readerType: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newThreadBody, setNewThreadBody] = useState("");
  const [postAnonymous, setPostAnonymous] = useState(false);
  const [replyAnonymous, setReplyAnonymous] = useState<Record<string, boolean>>({});
  const [replyBodies, setReplyBodies] = useState<Record<string, string>>({});
  const [penNameDraft, setPenNameDraft] = useState("");
  const [savingPenName, setSavingPenName] = useState(false);
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
        viewer?: DiscussionViewer;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Could not load discussion");
      setThreads(data.threads ?? []);
      setViewer(
        data.viewer ?? {
          canWrite: false,
          penName: null,
          needsPenName: false,
          canModerate: false,
          readerType: null,
        },
      );
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

  const savePenName = async () => {
    const penName = penNameDraft.trim();
    if (!penName || savingPenName) return;
    setSavingPenName(true);
    setError("");
    try {
      const res = await fetch("/api/bible/discussion/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ penName }),
      });
      const data = (await res.json()) as { penName?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not save pen name");
      setViewer((prev) => ({
        ...prev,
        penName: data.penName ?? penName,
        needsPenName: false,
      }));
      setPenNameDraft("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save pen name");
    } finally {
      setSavingPenName(false);
    }
  };

  const postThread = async () => {
    const body = newThreadBody.trim();
    if (!body || submitting || !viewer.canWrite || viewer.needsPenName) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/bible/discussion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookSlug, chapter, body, anonymous: postAnonymous }),
      });
      const data = (await res.json()) as { thread?: DiscussionThread; error?: string };
      if (!res.ok || !data.thread) throw new Error(data.error ?? "Could not post");
      setThreads((prev) => [...prev, data.thread!]);
      setNewThreadBody("");
      setPostAnonymous(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not post");
    } finally {
      setSubmitting(false);
    }
  };

  const postReply = async (threadId: string) => {
    const body = (replyBodies[threadId] ?? "").trim();
    if (!body || submitting || !viewer.canWrite || viewer.needsPenName) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/bible/discussion/${threadId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, anonymous: replyAnonymous[threadId] ?? false }),
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
      setReplyAnonymous((prev) => ({ ...prev, [threadId]: false }));
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
    if (!window.confirm(t("bible.discussion.delete_thread_confirm", "Delete this post and all replies?"))) {
      return;
    }
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
    if (!window.confirm(t("bible.discussion.delete_reply_confirm", "Delete this reply?"))) {
      return;
    }
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

  function visibilityRadios(
    idPrefix: string,
    anonymous: boolean,
    onChange: (anonymous: boolean) => void,
    penName: string,
  ) {
    return (
      <fieldset className="flex flex-wrap gap-4 text-xs text-[var(--color-ink)]">
        <legend className="sr-only">{t("bible.discussion.visibility_label", "Post visibility")}</legend>
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name={`${idPrefix}-visibility`}
            checked={!anonymous}
            onChange={() => onChange(false)}
          />
          {t("bible.discussion.show_name", "Show my name ({name})").replace("{name}", penName)}
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name={`${idPrefix}-visibility`}
            checked={anonymous}
            onChange={() => onChange(true)}
          />
          {t("bible.discussion.post_anonymous", "Post anonymously")}
        </label>
      </fieldset>
    );
  }

  const penName = viewer.penName ?? "";

  return (
    <section className={`${HOME_HUB_PANEL_CLASS} space-y-4 bg-white`}>
      <div>
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">
          {t("bible.discussion.title", "Questions & thoughts")}
        </h2>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          {viewer.canModerate
            ? t(
                "bible.discussion.subtitle_moderator",
                "Sign in to write. You can edit or delete your own posts. Operators can moderate all posts.",
              )
            : t(
                "bible.discussion.subtitle",
                "Sign in to write. Choose to show your pen name or post anonymously on each message.",
              )}
        </p>
      </div>

      {!viewer.canWrite ? (
        <p className="text-sm text-[var(--color-ink)]">
          <Link href="/account/login" className="font-semibold text-[var(--color-link)]">
            {t("bible.discussion.sign_in", "Sign in")}
          </Link>{" "}
          {t("bible.discussion.sign_in_or", "or")}{" "}
          <Link href="/reader/login" className="font-semibold text-[var(--color-link)]">
            {t("bible.discussion.access_id", "Access ID")}
          </Link>{" "}
          {t("bible.discussion.sign_in_suffix", "to join the discussion.")}
        </p>
      ) : null}

      {viewer.canWrite && viewer.needsPenName ? (
        <div className="space-y-2 rounded-xl border border-[#e8e0d6] bg-[#faf8f5] p-3">
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            {t("bible.discussion.pen_name_title", "Choose a pen name")}
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            {t(
              "bible.discussion.pen_name_hint",
              "This name is saved on your profile. You can still post anonymously when you prefer.",
            )}
          </p>
          <label className="sr-only" htmlFor={`discussion-pen-name-${bookSlug}-${chapter}`}>
            {t("bible.discussion.pen_name_label", "Pen name")}
          </label>
          <input
            id={`discussion-pen-name-${bookSlug}-${chapter}`}
            type="text"
            maxLength={40}
            className="w-full rounded-xl border border-[#e8e0d6] bg-white px-3 py-2 text-sm"
            placeholder={t("bible.discussion.pen_name_placeholder", "e.g. Lily")}
            value={penNameDraft}
            onChange={(e) => setPenNameDraft(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              type="button"
              className={actionButtonClass("primary")}
              disabled={savingPenName || !penNameDraft.trim()}
              onClick={() => void savePenName()}
            >
              {t("bible.discussion.pen_name_save", "Save pen name")}
            </button>
          </div>
        </div>
      ) : null}

      {viewer.canWrite && !viewer.needsPenName ? (
        <div className="space-y-2">
          <label className="sr-only" htmlFor={`discussion-new-${bookSlug}-${chapter}`}>
            {t("bible.discussion.new_post_label", "Share a question or thought")}
          </label>
          <textarea
            id={`discussion-new-${bookSlug}-${chapter}`}
            rows={3}
            maxLength={2000}
            placeholder={t(
              "bible.discussion.new_post_placeholder",
              "Share a question or thought about this chapter…",
            )}
            className={textAreaClass()}
            value={newThreadBody}
            onChange={(e) => setNewThreadBody(e.target.value)}
          />
          {visibilityRadios(
            `new-${bookSlug}-${chapter}`,
            postAnonymous,
            setPostAnonymous,
            penName,
          )}
          <div className="flex justify-end">
            <button
              type="button"
              className={actionButtonClass("primary")}
              disabled={submitting || !newThreadBody.trim()}
              onClick={() => void postThread()}
            >
              {t("bible.discussion.post", "Post")}
            </button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-[var(--color-muted)]">
          {t("bible.discussion.loading", "Loading discussion…")}
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && threads.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">
          {t("bible.discussion.empty", "No posts yet. Be the first to share.")}
        </p>
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
                  {thread.authorDisplay} · {formatWhen(thread.createdAt)}
                  {thread.updatedAt !== thread.createdAt
                    ? ` · ${t("bible.discussion.edited", "edited")}`
                    : ""}
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
                        {t("bible.discussion.save", "Save")}
                      </button>
                      <button
                        type="button"
                        className={actionButtonClass()}
                        onClick={() => {
                          setEditingThreadId(null);
                          setEditDraft("");
                        }}
                      >
                        {t("bible.discussion.cancel", "Cancel")}
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
                          {t("bible.discussion.edit", "Edit")}
                        </button>
                      ) : null}
                      {thread.canDelete ? (
                        <button
                          type="button"
                          className={actionButtonClass("danger")}
                          onClick={() => void deleteThread(thread.id)}
                        >
                          {t("bible.discussion.delete", "Delete")}
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
                          {comment.authorDisplay} · {formatWhen(comment.createdAt)}
                          {comment.updatedAt !== comment.createdAt
                            ? ` · ${t("bible.discussion.edited", "edited")}`
                            : ""}
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
                                {t("bible.discussion.save", "Save")}
                              </button>
                              <button
                                type="button"
                                className={actionButtonClass()}
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditDraft("");
                                }}
                              >
                                {t("bible.discussion.cancel", "Cancel")}
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
                                  {t("bible.discussion.edit", "Edit")}
                                </button>
                              ) : null}
                              {comment.canDelete ? (
                                <button
                                  type="button"
                                  className={actionButtonClass("danger")}
                                  onClick={() => void deleteComment(comment.id, thread.id)}
                                >
                                  {t("bible.discussion.delete", "Delete")}
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

            {viewer.canWrite && !viewer.needsPenName ? (
              <div className="mt-3 space-y-2 border-t border-[#e8e0d6] pt-3">
                <label className="sr-only" htmlFor={`reply-${thread.id}`}>
                  {t("bible.discussion.reply_label", "Reply to post")}
                </label>
                <textarea
                  id={`reply-${thread.id}`}
                  rows={2}
                  maxLength={2000}
                  placeholder={t("bible.discussion.reply_placeholder", "Write a reply…")}
                  className={textAreaClass()}
                  value={replyBodies[thread.id] ?? ""}
                  onChange={(e) =>
                    setReplyBodies((prev) => ({ ...prev, [thread.id]: e.target.value }))
                  }
                />
                {visibilityRadios(
                  `reply-${thread.id}`,
                  replyAnonymous[thread.id] ?? false,
                  (anonymous) =>
                    setReplyAnonymous((prev) => ({ ...prev, [thread.id]: anonymous })),
                  penName,
                )}
                <div className="flex justify-end">
                  <button
                    type="button"
                    className={actionButtonClass("primary")}
                    disabled={submitting || !(replyBodies[thread.id] ?? "").trim()}
                    onClick={() => void postReply(thread.id)}
                  >
                    {t("bible.discussion.reply", "Reply")}
                  </button>
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
