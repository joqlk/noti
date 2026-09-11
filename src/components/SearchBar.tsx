"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { normalizeName } from "@/lib/validation";

export function SearchBar({ placeholder }: { placeholder?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const name = normalizeName(query);
    if (!name) return;
    router.push(`/to/${encodeURIComponent(name)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder ?? "Search a name..."}
        className="w-full rounded-full border border-stone-200 bg-white/90 px-5 py-3 pr-24 text-sm text-stone-800 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1.5 rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
      >
        Search
      </button>
    </form>
  );
}
