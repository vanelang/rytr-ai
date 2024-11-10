import { NextResponse } from "next/server";
import { db } from "@/db";
import { plans, users, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { LemonSqueezyWebhookEvent } from "@/types/lemonsqueezy";
import crypto from "crypto";

const LEMONSQUEEZY_SIGNATURE_HEADER = "x-signature";

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const signature = req.headers.get(LEMONSQUEEZY_SIGNATURE_HEADER);

    if (
      !signature ||
      !verifyWebhookSignature(payload, signature, process.env.LEMONSQUEEZY_WEBHOOK_SECRET!)
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(payload) as LemonSqueezyWebhookEvent;
    const { event_name } = event.meta;
    const { custom_data } = event.meta;
    const {
      status,
      customer_id,
      variant_id,
      current_period_start,
      current_period_end,
      renews_at,
      cancelled_at,
      pause_starts_at,
    } = event.data.attributes;

    if (!custom_data?.userId || !custom_data?.planId) {
      return NextResponse.json({ error: "Missing custom data" }, { status: 400 });
    }

    switch (event_name) {
      case "subscription_created":
      case "subscription_updated":
      case "subscription_resumed":
      case "subscription_unpaused": {
        // Update or create subscription
        const subscriptionData = {
          id: event.data.id,
          userId: custom_data.userId,
          planId: parseInt(custom_data.planId.toString()),
          status,
          variantId: variant_id.toString(),
          customerId: customer_id.toString(),
          currentPeriodStart: new Date(current_period_start),
          currentPeriodEnd: new Date(current_period_end),
          renewsAt: renews_at ? new Date(renews_at) : null,
          canceledAt: cancelled_at ? new Date(cancelled_at) : null,
          pausedAt: pause_starts_at ? new Date(pause_starts_at) : null,
          updatedAt: new Date(),
        };

        // First try to update existing subscription
        const existingSubscription = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.id, event.data.id),
        });

        if (existingSubscription) {
          await db
            .update(subscriptions)
            .set(subscriptionData)
            .where(eq(subscriptions.id, event.data.id));
        } else {
          // Create new subscription
          await db.insert(subscriptions).values({
            ...subscriptionData,
            createdAt: new Date(),
          });
        }

        // Update user with subscription ID and plan ID
        await db
          .update(users)
          .set({
            subscriptionId: event.data.id,
            planId: parseInt(custom_data.planId.toString()),
            customerId: customer_id.toString(),
            updatedAt: new Date(),
          })
          .where(eq(users.id, custom_data.userId));

        break;
      }

      case "subscription_cancelled":
      case "subscription_expired": {
        // Update subscription status
        await db
          .update(subscriptions)
          .set({
            status,
            canceledAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, event.data.id));

        // Get free plan
        const freePlan = await db.query.plans.findFirst({
          where: eq(plans.type, "free"),
        });

        if (freePlan) {
          // Update user to free plan and remove subscription
          await db
            .update(users)
            .set({
              planId: freePlan.id,
              subscriptionId: null,
              updatedAt: new Date(),
            })
            .where(eq(users.id, custom_data.userId));
        }
        break;
      }

      case "subscription_paused": {
        // Update subscription status
        await db
          .update(subscriptions)
          .set({
            status,
            pausedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, event.data.id));
        break;
      }

      case "subscription_payment_success": {
        // Update subscription period
        await db
          .update(subscriptions)
          .set({
            currentPeriodStart: new Date(current_period_start),
            currentPeriodEnd: new Date(current_period_end),
            renewsAt: renews_at ? new Date(renews_at) : null,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, event.data.id));
        break;
      }

      case "subscription_payment_failed":
      case "subscription_payment_recovered": {
        // Update subscription status
        await db
          .update(subscriptions)
          .set({
            status,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, event.data.id));
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
