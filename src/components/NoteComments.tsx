"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

export type Comment = {
  id: string;
  noteId: string;
  message: string;
  fromAlias: string | null;
  createdAt: string | Date;
};

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-KE", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

type NoteCommentsProps = {
  noteId: string;
  initialCount: number;
};

export function NoteComments({ noteId, initialCount }: NoteCommentsProps) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(initialCount);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fromAlias, setFromAlias] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCommentCount(initialCount);
  }, [initialCount]);

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/comments?noteId=${encodeURIComponent(noteId)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not load comments.");
        return;
      }

      setComments(data.comments);
      setCommentCount(data.comments.length);
      setLoaded(true);
    } catch {
      setError("Could not load comments.");
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  async function handleToggle() {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen && !loaded) {
      await loadComments();
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, message, fromAlias }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not post comment.");
        return;
      }

      setComments((prev) => [...prev, data.comment]);
      setCommentCount((prev) => prev + 1);
      setMessage("");
      setFromAlias("");
      setOpen(true);
      setLoaded(true);
    } catch {
      setError("Could not post comment. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const label =
    commentCount === 0
      ? "Comment"
      : `${commentCount} comment${commentCount === 1 ? "" : "s"}`;

  return (
    <div className="border-t border-stone-200/80 px-1 pt-3">
      <button
        type="button"
        onClick={handleToggle}
        className="text-sm font-medium text-stone-500 transition hover:text-stone-800"
      >
        {open ? "Hide" : "Show"} {label}
      </button>

      {open ? (
        <div className="mt-4 space-y-4">
          {loading ? (
            <p className="text-sm text-stone-400">Loading comments...</p>
          ) : null}

          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl border border-stone-200/80 bg-stone-50/80 px-4 py-3"
            >
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <p className="text-xs uppercase tracking-wide text-stone-400">Reply</p>
                <time className="text-xs text-stone-400">{formatDate(comment.createdAt)}</time>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-800">
                {comment.message}
              </p>
              {comment.fromAlias ? (
                <p className="mt-2 text-xs text-stone-500">
                  from{" "}
                  <span className="font-medium text-stone-600">{comment.fromAlias}</span>
                </p>
              ) : null}
            </div>
          ))}

          {!loading && loaded && comments.length === 0 ? (
            <p className="text-sm text-stone-400">No comments yet. Be the first.</p>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Reply anonymously..."
              rows={3}
              className="w-full resize-y rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
              maxLength={500}
              required
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={fromAlias}
                onChange={(event) => setFromAlias(event.target.value)}
                placeholder="From (optional)"
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100 sm:flex-1"
                maxLength={30}
              />
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-60 sm:shrink-0"
              >
                {submitting ? "Posting..." : "Post reply"}
              </button>
            </div>
          </form>

          {error ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
