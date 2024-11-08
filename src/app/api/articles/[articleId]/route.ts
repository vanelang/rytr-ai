import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from "@/db";
import { articles, ResearchSource, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

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

  const { content } = await request.json();

  if (typeof content !== "string") {
    return new NextResponse("Invalid content", { status: 400 });
  }

  const article = await db.query.articles.findFirst({
    where: and(eq(articles.id, parseInt(articleId)), eq(articles.userId, dbUser.id)),
  });

  if (!article) {
    return new NextResponse("Not Found", { status: 404 });
  }

  await db
    .update(articles)
    .set({
      content,
      updatedAt: new Date(),
    })
    .where(and(eq(articles.id, parseInt(articleId)), eq(articles.userId, dbUser.id)));

  return new NextResponse(null, { status: 204 });
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
