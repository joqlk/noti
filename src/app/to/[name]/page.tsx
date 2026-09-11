import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { NoteFeed } from "@/components/NoteFeed";
import { db } from "@/lib/db";
import { normalizeName } from "@/lib/validation";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ name: string }>;
};

async function getNotesForName(name: string) {
  const notes = await db.note.findMany({
    where: { toName: name },
    orderBy: { createdAt: "desc" },
    take: 21,
  });

  const hasMore = notes.length > 20;
  const items = hasMore ? notes.slice(0, 20) : notes;

  return {
    notes: items,
    nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
  };
}

export async function generateMetadata({ params }: PageProps) {
  const { name: rawName } = await params;
  const name = normalizeName(decodeURIComponent(rawName));

  return {
    title: `Notes for ${name} · Noti`,
    description: `Anonymous notes left for ${name}.`,
  };
}

export default async function NamePage({ params }: PageProps) {
  const { name: rawName } = await params;
  const name = normalizeName(decodeURIComponent(rawName));

  if (!name) notFound();

  const { notes, nextCursor } = await getNotesForName(name);

  return (
    <div className="page-shell">
      <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
        <Header />

        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-stone-400">Notes for</p>
          <h2 className="mt-2 text-4xl font-semibold text-stone-900">{name}</h2>
          <p className="mt-2 text-sm text-stone-500">
            {notes.length === 0
              ? "Nothing here yet."
              : `${notes.length}${nextCursor ? "+" : ""} note${notes.length === 1 ? "" : "s"}`}
          </p>
          <Link
            href={`/write?to=${encodeURIComponent(name)}`}
            className="mt-4 inline-flex rounded-full bg-amber-400 px-4 py-2 text-sm font-medium text-stone-900 transition hover:bg-amber-300"
          >
            Write to {name}
          </Link>
        </div>

        <NoteFeed name={name} initialNotes={notes} initialCursor={nextCursor} />
      </div>
    </div>
  );
}
