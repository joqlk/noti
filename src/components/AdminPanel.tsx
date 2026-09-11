"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
      <p className="mb-6 text-sm text-stone-500">Enter your admin secret to moderate notes.</p>

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

export function AdminPanel({ initialNotes }: { initialNotes: Note[] }) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this note permanently?")) return;

      setError("");
      setDeletingId(id);

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

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">Moderation</h2>
          <p className="text-sm text-stone-500">{notes.length} notes shown</p>
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
                  onClick={() => handleDelete(note.id)}
                  disabled={deletingId === note.id}
                  className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                >
                  {deletingId === note.id ? "Deleting..." : "Delete note"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
