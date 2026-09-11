import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { createClient } from "@libsql/client";

config({ path: ".env.production.local" });
config();

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  const migration = readFileSync(
    "prisma/migrations/20260911080150_init/migration.sql",
    "utf8",
  );

  const statements = migration
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await client.execute(statement);
  }

  const count = await client.execute("SELECT COUNT(*) as count FROM Note");
  const existing = Number(count.rows[0]?.count ?? 0);

  if (existing === 0) {
    const seedNotes = [
      [
        "Wangari",
        "You have the kind of laugh that makes a room feel lighter. Never change that.",
        "Someone who noticed",
      ],
      [
        "Kimani",
        "Bro get your sh*t together. Hawa wasichana watakumaliza.",
        "Mandem",
      ],
      ["Moraa", "Imy you stubborn human", "thesaurus"],
      [
        "Anyone",
        "It's almost unfair how much I want someone I've never even let myself have. Maybe that's the beauty of leaving it unsaid.",
        "A Safe Distance",
      ],
      [
        "Patra",
        "I am enjoying it here. I pray your farm thing works out.",
        "Bwatuti",
      ],
      ["Ronnie", "Huwezi chukua wasichana wote wa Nairobi buda. Chilax", null],
      ["Katungi", "Cool guy that one, has informative insights too", "XX"],
      [
        "Women",
        "My heart has the capacity to love you all. Don't be mad if you're sharing me. The more the merrier",
        "Kevo",
      ],
    ];

    for (const [toName, message, fromAlias] of seedNotes) {
      const id = crypto.randomUUID().replace(/-/g, "").slice(0, 25);
      await client.execute({
        sql: "INSERT INTO Note (id, toName, message, fromAlias, createdAt) VALUES (?, ?, ?, ?, datetime('now'))",
        args: [id, toName, message, fromAlias],
      });
    }

    console.log(`Seeded ${seedNotes.length} notes.`);
  } else {
    console.log(`Database already has ${existing} notes.`);
  }

  console.log("Turso setup complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
