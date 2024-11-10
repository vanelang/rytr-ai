import { db } from "@/db";
import { articles, plans, users, type PlanFeatures } from "@/db/schema";
import { eq, and, gte, count } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function checkArticleLimit(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      plan: true,
    },
  });

  if (!user || !user.plan) {
    return {
      allowed: false,
      error: "User plan not found",
    };
  }

  const features = user.plan.features as PlanFeatures;

  // If unlimited articles
  if (features.articleLimit === -1) {
    return { allowed: true };
  }

  // Check current month's article count
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const articleCount = await db
    .select({ value: count() })
    .from(articles)
    .where(and(eq(articles.userId, userId), gte(articles.createdAt, startOfMonth)));

  return {
    allowed: articleCount[0].value < features.articleLimit,
    error: articleCount[0].value >= features.articleLimit ? "Monthly article limit reached" : null,
  };
}
