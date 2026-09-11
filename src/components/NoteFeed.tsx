"use client";

import { useCallback, useEffect, useState } from "react";
import { NoteCard, type Note } from "./NoteCard";

type NoteFeedProps = {
  name?: string;
  initialNotes: Note[];
  initialCursor: string | null;
};

export function NoteFeed({ name, initialNotes, initialCursor }: NoteFeedProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNotes(initialNotes);
    setCursor(initialCursor);
  }, [initialNotes, initialCursor, name]);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({ cursor });
      if (name) params.set("name", name);

      const res = await fetch(`/api/notes?${params}`);
      const data = await res.json();

      setNotes((prev) => [...prev, ...data.notes]);
      setCursor(data.nextCursor);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, name]);

  if (notes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 bg-white/60 px-6 py-12 text-center">
        <p className="text-stone-500">
          {name
            ? `No notes for ${name} yet. Be the first to write one.`
            : "No notes yet. Leave the first one."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}

      {cursor ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-full border border-stone-200 bg-white px-5 py-2 text-sm text-stone-600 transition hover:border-amber-200 hover:text-stone-900 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
