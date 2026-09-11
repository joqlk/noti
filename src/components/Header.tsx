import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export function Header() {
  return (
    <header className="mb-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/" className="group inline-block">
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900 transition group-hover:text-amber-900">
              {APP_NAME}
            </h1>
          </Link>
          <p className="mt-1 text-sm text-stone-500">{APP_TAGLINE}</p>
        </div>

        <Link
          href="/write"
          className="shrink-0 rounded-full bg-amber-400 px-4 py-2 text-sm font-medium text-stone-900 transition hover:bg-amber-300"
        >
          Write a note
        </Link>
      </div>
    </header>
  );
}
