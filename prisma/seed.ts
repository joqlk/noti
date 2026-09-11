import "dotenv/config";
import { db } from "../src/lib/db";

const seedNotes = [
  {
    toName: "Wangari",
    message: "You have the kind of laugh that makes a room feel lighter. Never change that.",
    fromAlias: "Someone who noticed",
  },
  {
    toName: "Kimani",
    message: "Bro get your sh*t together. Hawa wasichana watakumaliza.",
    fromAlias: "Mandem",
  },
  {
    toName: "Moraa",
    message: "Imy you stubborn human",
    fromAlias: "thesaurus",
  },
  {
    toName: "Anyone",
    message:
      "It's almost unfair how much I want someone I've never even let myself have. Maybe that's the beauty of leaving it unsaid.",
    fromAlias: "A Safe Distance",
  },
  {
    toName: "Patra",
    message: "I am enjoying it here. I pray your farm thing works out.",
    fromAlias: "Bwatuti",
  },
  {
    toName: "Ronnie",
    message: "Huwezi chukua wasichana wote wa Nairobi buda. Chilax",
    fromAlias: undefined,
  },
  {
    toName: "Katungi",
    message: "Cool guy that one, has informative insights too",
    fromAlias: "XX",
  },
  {
    toName: "Women",
    message:
      "My heart has the capacity to love you all. Don't be mad if you're sharing me. The more the merrier",
    fromAlias: "Kevo",
  },
];

async function main() {
  const count = await db.note.count();
  if (count > 0) return;

  await db.note.createMany({ data: seedNotes });
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
