"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Comment } from "./NoteComments";

type AdminComment = Comment & {
  note: {
    id: string;
    toName: string;
    message: string;
  };
};
import { NoteCard, type Note } from "./NoteCard";

export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not sign in.");
        return;
      }

      router.refresh();
    } catch {
      setError("Could not sign in. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!configured) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
        Admin is not configured yet. Add <code className="font-mono">ADMIN_SECRET</code> to your
        environment variables, then redeploy.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-stone-200/80 bg-white/90 p-6 shadow-sm sm:p-8">
      <h2 className="mb-2 text-xl font-semibold text-stone-900">Admin sign in</h2>
      <p className="mb-6 text-sm text-stone-500">Enter your admin secret to moderate notes and comments.</p>

      <label htmlFor="secret" className="mb-2 block text-sm font-medium text-stone-700">
        Admin secret
      </label>
      <input
        id="secret"
        type="password"
        value={secret}
        onChange={(event) => setSecret(event.target.value)}
        className="mb-4 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-800 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
        required
      />

      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-60"
      >
        {submitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-KE", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function AdminPanel({
  initialNotes,
  initialComments,
}: {
  initialNotes: Note[];
  initialComments: AdminComment[];
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [comments, setComments] = useState<AdminComment[]>(initialComments);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setNotes(initialNotes);
    setComments(initialComments);
  }, [initialNotes, initialComments]);

  const handleDeleteNote = useCallback(
    async (id: string) => {
      if (!confirm("Delete this note permanently?")) return;

      setError("");
      setDeletingId(`note:${id}`);

      try {
        const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Could not delete note.");
          return;
        }

        setNotes((prev) => prev.filter((note) => note.id !== id));
        router.refresh();
      } catch {
        setError("Could not delete note. Try again.");
      } finally {
        setDeletingId(null);
      }
    },
    [router],
  );

  const handleDeleteComment = useCallback(
    async (id: string) => {
      if (!confirm("Delete this comment permanently?")) return;

      setError("");
      setDeletingId(`comment:${id}`);

      try {
        const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Could not delete comment.");
          return;
        }

        setComments((prev) => prev.filter((comment) => comment.id !== id));
        router.refresh();
      } catch {
        setError("Could not delete comment. Try again.");
      } finally {
        setDeletingId(null);
      }
    },
    [router],
  );

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">Moderation</h2>
          <p className="text-sm text-stone-500">
            {notes.length} notes · {comments.length} comments
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600 transition hover:border-stone-300 hover:text-stone-900"
        >
          Sign out
        </button>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="space-y-10">
        <section>
          <h3 className="mb-4 text-lg font-semibold text-stone-900">Notes</h3>
          {notes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-200 bg-white/60 px-6 py-12 text-center text-stone-500">
              No notes to moderate.
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="space-y-2">
                  <NoteCard note={note} />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(note.id)}
                      disabled={deletingId === `note:${note.id}`}
                      className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                    >
                      {deletingId === `note:${note.id}` ? "Deleting..." : "Delete note"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-4 text-lg font-semibold text-stone-900">Comments</h3>
          {comments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-200 bg-white/60 px-6 py-12 text-center text-stone-500">
              No comments to moderate.
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <article className="note-card">
                    <div className="mb-3 flex items-baseline justify-between gap-3">
                      <p className="text-sm text-stone-500">
                        Reply on note to{" "}
                        <span className="font-medium text-stone-700">{comment.note.toName}</span>
                      </p>
                      <time className="shrink-0 text-xs text-stone-400">
                        {formatDate(comment.createdAt)}
                      </time>
                    </div>
                    <p className="mb-3 line-clamp-2 text-xs text-stone-400">
                      Note: {comment.note.message}
                    </p>
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-stone-800">
                      {comment.message}
                    </p>
                    {comment.fromAlias ? (
                      <p className="mt-4 text-sm text-stone-500">
                        from{" "}
                        <span className="font-medium text-stone-600">
                          {comment.fromAlias}
                        </span>
                      </p>
                    ) : null}
                  </article>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={deletingId === `comment:${comment.id}`}
                      className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                    >
                      {deletingId === `comment:${comment.id}` ? "Deleting..." : "Delete comment"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
