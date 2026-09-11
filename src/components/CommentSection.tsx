"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type Comment = {
  id: string;
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

function CommentCard({ comment }: { comment: Comment }) {
  return (
    <article className="note-card group">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-sm text-stone-500">Comment</p>
        <time className="shrink-0 text-xs text-stone-400 opacity-0 transition-opacity group-hover:opacity-100">
          {formatDate(comment.createdAt)}
        </time>
      </div>

      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-stone-800">
        {comment.message}
      </p>

      {comment.fromAlias ? (
        <p className="mt-4 text-sm text-stone-500">
          from{" "}
          <span className="font-medium text-stone-600">{comment.fromAlias}</span>
        </p>
      ) : null}
    </article>
  );
}

type CommentSectionProps = {
  initialComments: Comment[];
  initialCursor: string | null;
};

export function CommentSection({ initialComments, initialCursor }: CommentSectionProps) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fromAlias, setFromAlias] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setComments(initialComments);
    setCursor(initialCursor);
  }, [initialComments, initialCursor]);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/comments?cursor=${cursor}`);
      const data = await res.json();

      setComments((prev) => [...prev, ...data.comments]);
      setCursor(data.nextCursor);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, fromAlias }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not post comment.");
        return;
      }

      setComments((prev) => [data.comment, ...prev]);
      setMessage("");
      setFromAlias("");
      router.refresh();
    } catch {
      setError("Could not post comment. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-14 border-t border-stone-200/80 pt-10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-stone-900">Comments</h2>
        <p className="mt-1 text-sm text-stone-500">
          Say something to everyone on the feed. Anonymous, no account needed.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-3xl border border-stone-200/80 bg-white/90 p-5 shadow-sm sm:p-6"
      >
        <label htmlFor="comment" className="mb-2 block text-sm font-medium text-stone-700">
          Leave a comment
        </label>
        <textarea
          id="comment"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="What's on your mind?"
          rows={4}
          className="mb-3 w-full resize-y rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-800 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
          maxLength={500}
          required
        />
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="commentAlias" className="mb-2 block text-sm font-medium text-stone-700">
              From <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              id="commentAlias"
              value={fromAlias}
              onChange={(event) => setFromAlias(event.target.value)}
              placeholder="Secret, a friend, initials..."
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-800 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
              maxLength={30}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-60 sm:shrink-0"
          >
            {submitting ? "Posting..." : "Post comment"}
          </button>
        </div>
        <p className="text-right text-xs text-stone-400">{message.length}/500</p>

        {error ? (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}
      </form>

      {comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white/60 px-6 py-12 text-center text-stone-500">
          No comments yet. Start the conversation.
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}

          {cursor ? (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={loadMore}
                disabled={loading}
                className="rounded-full border border-stone-200 bg-white px-5 py-2 text-sm text-stone-600 transition hover:border-amber-200 hover:text-stone-900 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load more comments"}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
