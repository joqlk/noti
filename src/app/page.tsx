import Link from "next/link";
import { CommentSection } from "@/components/CommentSection";
import { Header } from "@/components/Header";
import { NoteFeed } from "@/components/NoteFeed";
import { SearchBar } from "@/components/SearchBar";
import { db } from "@/lib/db";
import { SAMPLE_NAMES } from "@/lib/constants";

export const dynamic = "force-dynamic";

async function getRecentNotes() {
  const notes = await db.note.findMany({
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

async function getRecentComments() {
  const comments = await db.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 21,
  });

  const hasMore = comments.length > 20;
  const items = hasMore ? comments.slice(0, 20) : comments;

  return {
    comments: items,
    nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
  };
}

export default async function HomePage() {
  const { notes, nextCursor } = await getRecentNotes();
  const { comments, nextCursor: commentsCursor } = await getRecentComments();

  return (
    <div className="page-shell">
      <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
        <Header />

        <p className="mb-6 text-center text-[15px] leading-relaxed text-stone-600">
          Read what strangers wrote to people who share that name. Leave one if
          you want. Pls be kind (╥﹏╥)
        </p>

        <div className="mb-8">
          <SearchBar placeholder="Wangari, Moraa, Kimani..." />
        </div>

        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {SAMPLE_NAMES.map((name) => (
            <Link
              key={name}
              href={`/to/${encodeURIComponent(name)}`}
              className="rounded-full border border-stone-200 bg-white/80 px-3 py-1 text-xs text-stone-600 transition hover:border-amber-200 hover:text-stone-900"
            >
              {name}
            </Link>
          ))}
        </div>

        <NoteFeed initialNotes={notes} initialCursor={nextCursor} />

        <CommentSection
          initialComments={comments}
          initialCursor={commentsCursor}
        />
      </div>
    </div>
  );
}
