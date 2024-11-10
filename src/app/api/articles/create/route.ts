import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { checkArticleLimit } from "@/middleware/check-article-limit";

export async function POST(req: Request) {
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

    // Check article limit
    const limitCheck = await checkArticleLimit(dbUser.id);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.error }, { status: 403 });
    }

    const { title } = await req.json();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const article = await db
      .insert(articles)
      .values({
        userId: dbUser.id,
        title,
        status: "draft",
        content: null,
        metadata: {
          keywords: [],
          description: "",
          readingTime: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Revalidate the articles cache
    revalidateTag("articles");

    return NextResponse.json({
      success: true,
      articleId: article[0].id,
      article: article[0],
    });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { error: "Failed to create article", details: error },
      { status: 500 }
    );
  }
}
