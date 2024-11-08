import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { eq, and } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { htmlToMarkdown } from "@/lib/markdown";

export async function PATCH(req: Request, { params }: { params: { articleId: string } }) {
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

    const { content } = await req.json();

    // Convert HTML to Markdown before saving
    const markdownContent = htmlToMarkdown(content);

    const article = await db
      .update(articles)
      .set({
        content: markdownContent,
        updatedAt: new Date(),
      })
      .where(and(eq(articles.id, parseInt(params.articleId)), eq(articles.userId, dbUser.id)))
      .returning();

    revalidateTag("articles");

    return NextResponse.json({ article: article[0] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}
