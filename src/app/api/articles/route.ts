import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userArticles = await db.query.articles.findMany({
      where: eq(articles.userId, dbUser.id),
      orderBy: [desc(articles.createdAt)],
    });

    return NextResponse.json({ articles: userArticles });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}
