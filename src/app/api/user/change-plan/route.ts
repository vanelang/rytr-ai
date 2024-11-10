import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, articles, plans, type PlanFeatures } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { eq, and, gte, count } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    // Get user and their current plan
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
      with: {
        plan: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the new plan
    const newPlan = await db.query.plans.findFirst({
      where: eq(plans.id, planId),
    });

    if (!newPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // If downgrading (new plan has lower or finite limit), check article count
    const currentPlanFeatures = user.plan?.features as PlanFeatures;
    const newPlanFeatures = newPlan.features as PlanFeatures;

    const isDowngrade =
      currentPlanFeatures.articleLimit === -1 ||
      (newPlanFeatures.articleLimit !== -1 &&
        newPlanFeatures.articleLimit < currentPlanFeatures.articleLimit);

    if (isDowngrade && newPlanFeatures.articleLimit !== -1) {
      // Check current month's article count
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const articleCount = await db
        .select({ value: count() })
        .from(articles)
        .where(and(eq(articles.userId, user.id), gte(articles.createdAt, startOfMonth)));

      const currentArticleCount = Number(articleCount[0].value);

      if (currentArticleCount > newPlanFeatures.articleLimit) {
        return NextResponse.json(
          {
            error: `Cannot downgrade: You have ${currentArticleCount} articles this month, but the ${newPlan.name} plan only allows ${newPlanFeatures.articleLimit} articles. Please delete some articles to downgrade.`,
          },
          { status: 400 }
        );
      }
    }

    // Update user's plan
    await db
      .update(users)
      .set({
        planId: planId,
        updatedAt: new Date(),
      })
      .where(eq(users.email, session.user.email));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error changing plan:", error);
    return NextResponse.json({ error: "Failed to change plan", details: error }, { status: 500 });
  }
}
