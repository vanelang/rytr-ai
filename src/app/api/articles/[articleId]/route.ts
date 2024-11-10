import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth.config";
import { db } from "@/db";
import { articles, ResearchSource, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

interface RouteParams {
  params: Promise<{ articleId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { articleId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!dbUser) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const article = await db.query.articles.findFirst({
    where: and(eq(articles.id, parseInt(articleId)), eq(articles.userId, dbUser.id)),
  });

  if (!article) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const response = {
    ...article,
    sources: article.sources || [],
    formattedSources: article.sources
      ? article.sources.map((source: ResearchSource) => ({
          ...source,
          displayText: `${source.title} - ${source.source}`,
        }))
      : [],
  };

  return NextResponse.json(response);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { content } = await request.json();
    const articleId = parseInt((await params).articleId);

    await db.update(articles).set({ content }).where(eq(articles.id, articleId));

    // Revalidate both the blog list and the specific article page
    revalidatePath("/blog");
    revalidatePath(`/blog/${articleId}`);

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Error updating article:", error);
    return new Response(null, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { articleId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!dbUser) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await db
    .delete(articles)
    .where(and(eq(articles.id, parseInt(articleId)), eq(articles.userId, dbUser.id)));

  return new NextResponse(null, { status: 204 });
}
