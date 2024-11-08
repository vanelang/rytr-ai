import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { DashboardContent } from "./dashboard-content";
import { unstable_cache } from "next/cache";

// Cache function for fetching articles
const getUserArticles = unstable_cache(
  async (userId: string) => {
    return await db.query.articles.findMany({
      where: eq(articles.userId, userId),
      orderBy: [desc(articles.createdAt)],
    });
  },
  ["user-articles"],
  {
    revalidate: 60, // Cache for 1 minute
    tags: ["articles"], // Tag for manual revalidation
  }
);

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!dbUser) {
    redirect("/");
  }

  const userArticles = await getUserArticles(dbUser.id);

  return <DashboardContent user={session.user} initialArticles={userArticles} />;
}
