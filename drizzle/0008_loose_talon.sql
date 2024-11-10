ALTER TABLE "subscriptions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "variant_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "customer_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "paused_at" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "renews_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "customer_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "cancel_at";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "stripe_customer_id";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "stripe_subscription_id";