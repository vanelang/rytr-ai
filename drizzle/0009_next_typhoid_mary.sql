CREATE TABLE IF NOT EXISTS "users_to_subscriptions" (
	"user_id" text NOT NULL,
	"subscription_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_subscription_id_subscriptions_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_to_subscriptions" ADD CONSTRAINT "users_to_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_to_subscriptions" ADD CONSTRAINT "users_to_subscriptions_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
