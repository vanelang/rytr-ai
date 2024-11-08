import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles, contentGenerationQueue, users } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

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

    await db.insert(contentGenerationQueue).values({
      articleId: article[0].id,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

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
