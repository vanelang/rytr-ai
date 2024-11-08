CREATE TABLE IF NOT EXISTS "content_generation_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content_generation_queue" ADD CONSTRAINT "content_generation_queue_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
