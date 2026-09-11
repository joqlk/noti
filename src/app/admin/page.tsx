import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { AdminLogin, AdminPanel } from "@/components/AdminPanel";
import { isAdminConfigured, isAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Admin · Noti",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function getAllNotes() {
  return db.note.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export default async function AdminPage() {
  const configured = isAdminConfigured();
  const authenticated = configured && (await isAdminSession());
  const notes = authenticated ? await getAllNotes() : [];

  return (
    <div className="page-shell">
      <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
        <Header />

        {authenticated ? (
          <AdminPanel initialNotes={notes} />
        ) : (
          <AdminLogin configured={configured} />
        )}
      </div>
    </div>
  );
}
