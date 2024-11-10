import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { db } from "@/db";
import { users, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY!;

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
      with: {
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.subscription) {
      return NextResponse.json({ message: "No active subscription found" });
    }

    // Cancel the subscription in LemonSqueezy
    const cancelResponse = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${user.subscription.id}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/vnd.api+json",
          Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
        },
      }
    );

    if (!cancelResponse.ok) {
      throw new Error("Failed to cancel subscription");
    }

    // The webhook will handle updating the database
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to cancel subscription",
      },
      { status: 500 }
    );
  }
}
