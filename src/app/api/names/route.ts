import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!q) {
    const recent = await db.note.groupBy({
      by: ["toName"],
      _count: { toName: true },
      orderBy: { _count: { toName: "desc" } },
      take: 12,
    });

    return NextResponse.json({
      names: recent.map((item) => ({
        name: item.toName,
        count: item._count.toName,
      })),
    });
  }

  const matches = await db.note.findMany({
    where: {
      toName: { contains: q },
    },
    select: { toName: true },
    distinct: ["toName"],
    take: 8,
  });

  return NextResponse.json({
    names: matches.map((item) => ({ name: item.toName })),
  });
}
