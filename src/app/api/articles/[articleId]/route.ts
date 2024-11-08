import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ articleId: string }> }
) {
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
    where: and(eq(articles.id, parseInt((await params).articleId)), eq(articles.userId, dbUser.id)),
  });

  if (!article) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.json(article);
}
