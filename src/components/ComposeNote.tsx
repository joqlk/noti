"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ComposeNoteProps = {
  defaultToName?: string;
};

export function ComposeNote({ defaultToName = "" }: ComposeNoteProps) {
  const router = useRouter();
  const [toName, setToName] = useState(defaultToName);
  const [message, setMessage] = useState("");
  const [fromAlias, setFromAlias] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toName, message, fromAlias }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      router.push(`/to/${encodeURIComponent(data.note.toName)}`);
      router.refresh();
    } catch {
      setError("Could not send your note. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="toName" className="mb-2 block text-sm font-medium text-stone-700">
          To
        </label>
        <input
          id="toName"
          value={toName}
          onChange={(event) => setToName(event.target.value)}
          placeholder="Wangari, Moraa, Kimani..."
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-800 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
          maxLength={50}
          required
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-stone-700">
          Your note
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Say what you need to say..."
          rows={6}
          className="w-full resize-y rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-800 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
          maxLength={500}
          required
        />
        <p className="mt-1 text-right text-xs text-stone-400">{message.length}/500</p>
      </div>

      <div>
        <label htmlFor="fromAlias" className="mb-2 block text-sm font-medium text-stone-700">
          From <span className="font-normal text-stone-400">(optional)</span>
        </label>
        <input
          id="fromAlias"
          value={fromAlias}
          onChange={(event) => setFromAlias(event.target.value)}
          placeholder="Secret, a friend, initials..."
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-800 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
          maxLength={30}
        />
      </div>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Send note"}
      </button>
    </form>
  );
}
