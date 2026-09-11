import Link from "next/link";

export type Note = {
  id: string;
  toName: string;
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

export function NoteCard({ note }: { note: Note }) {
  return (
    <article className="note-card group">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-sm text-stone-500">
          To{" "}
          <Link
            href={`/to/${encodeURIComponent(note.toName)}`}
            className="font-medium text-stone-800 underline decoration-amber-300/70 underline-offset-2 transition-colors hover:text-amber-900"
          >
            {note.toName}
          </Link>
        </p>
        <time className="shrink-0 text-xs text-stone-400 opacity-0 transition-opacity group-hover:opacity-100">
          {formatDate(note.createdAt)}
        </time>
      </div>

      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-stone-800">
        {note.message}
      </p>

      {note.fromAlias ? (
        <p className="mt-4 text-sm text-stone-500">
          from{" "}
          <span className="font-medium text-stone-600">{note.fromAlias}</span>
        </p>
      ) : null}
    </article>
  );
}
