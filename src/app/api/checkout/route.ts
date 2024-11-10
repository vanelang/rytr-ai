import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { db } from "@/db";
import { users, plans } from "@/db/schema";
import { eq } from "drizzle-orm";

const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY!;
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID!;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await req.json();

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const plan = await db.query.plans.findFirst({
      where: eq(plans.id, planId),
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Get LemonSqueezy variant ID based on plan type
    const variantId = getLemonSqueezyVariantId(plan.type);

    const checkoutData = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: {
              userId: user.id,
              planId: plan.id.toString(),
            },
          },
          product_options: {
            redirect_url: `${process.env.NEXTAUTH_URL}/dashboard?upgrade=success`,
          },
          checkout_options: {
            subscription_preview: true,
          },
          test_mode: false,
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: LEMONSQUEEZY_STORE_ID,
            },
          },
          variant: {
            data: {
              type: "variants",
              id: variantId,
            },
          },
        },
      },
    };

    // Create checkout session
    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.detail || "Failed to create checkout session");
    }

    const checkout = await response.json();

    if (!checkout.data?.attributes?.url) {
      throw new Error("Invalid checkout response from LemonSqueezy");
    }

    return NextResponse.json({ url: checkout.data.attributes.url });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create checkout session",
      },
      { status: 500 }
    );
  }
}

function getLemonSqueezyVariantId(planType: string): string {
  switch (planType) {
    case "starter":
      return process.env.LEMONSQUEEZY_STARTER_VARIANT_ID!;
    case "unlimited":
      return process.env.LEMONSQUEEZY_UNLIMITED_VARIANT_ID!;
    default:
      throw new Error("Invalid plan type");
  }
}
