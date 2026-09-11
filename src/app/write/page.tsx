import { Header } from "@/components/Header";
import { ComposeNote } from "@/components/ComposeNote";

export const metadata = {
  title: "Write a note · Noti",
  description: "Leave an anonymous note for someone by name.",
};

type PageProps = {
  searchParams: Promise<{ to?: string }>;
};

export default async function WritePage({ searchParams }: PageProps) {
  const { to } = await searchParams;
  const defaultToName = to ? decodeURIComponent(to) : "";

  return (
    <div className="page-shell">
      <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
        <Header />

        <div className="rounded-3xl border border-stone-200/80 bg-white/90 p-6 shadow-sm sm:p-8">
          <h2 className="mb-2 text-xl font-semibold text-stone-900">Leave a note</h2>
          <p className="mb-6 text-sm text-stone-500">
            Anonymous. No account needed. Be kind — words stick.
          </p>
          <ComposeNote defaultToName={defaultToName} />
        </div>
      </div>
    </div>
  );
}
