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

function parseDate(dateString: string | null): Date | null {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch {
    return null;
  }
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
    const { event_name, custom_data } = event.meta;
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
      console.error("Missing custom data:", custom_data);
      return NextResponse.json({ error: "Missing custom data" }, { status: 400 });
    }

    switch (event_name) {
      case "subscription_created": {
        // First, create the subscription record
        const subscriptionData = {
          id: event.data.id,
          userId: custom_data.userId,
          planId: parseInt(custom_data.planId.toString()),
          status,
          variantId: variant_id.toString(),
          customerId: customer_id.toString(),
          currentPeriodStart: parseDate(current_period_start) || new Date(),
          currentPeriodEnd: parseDate(current_period_end) || new Date(),
          renewsAt: parseDate(renews_at),
          canceledAt: parseDate(cancelled_at),
          pausedAt: parseDate(pause_starts_at),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Insert the subscription
        await db.insert(subscriptions).values(subscriptionData);

        // Then update the user with the subscription ID and plan ID
        const userUpdateResult = await db
          .update(users)
          .set({
            subscriptionId: event.data.id,
            planId: parseInt(custom_data.planId.toString()),
            customerId: customer_id.toString(),
            updatedAt: new Date(),
          })
          .where(eq(users.id, custom_data.userId))
          .returning({ updatedId: users.id });

        if (!userUpdateResult.length) {
          throw new Error(
            `Failed to update user ${custom_data.userId} with subscription ${event.data.id}`
          );
        }

        break;
      }

      case "subscription_updated":
      case "subscription_resumed":
      case "subscription_unpaused": {
        // Update subscription
        await db
          .update(subscriptions)
          .set({
            status,
            currentPeriodStart: parseDate(current_period_start) || new Date(),
            currentPeriodEnd: parseDate(current_period_end) || new Date(),
            renewsAt: parseDate(renews_at),
            canceledAt: parseDate(cancelled_at),
            pausedAt: parseDate(pause_starts_at),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, event.data.id));

        // Update user's plan
        await db
          .update(users)
          .set({
            planId: parseInt(custom_data.planId.toString()),
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

      case "subscription_payment_success": {
        await db
          .update(subscriptions)
          .set({
            currentPeriodStart: parseDate(current_period_start) || new Date(),
            currentPeriodEnd: parseDate(current_period_end) || new Date(),
            renewsAt: parseDate(renews_at),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, event.data.id));
        break;
      }

      case "subscription_payment_failed":
      case "subscription_payment_recovered": {
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
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Webhook handler failed",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
