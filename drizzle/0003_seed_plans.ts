import { sql } from "drizzle-orm";
import { PlanFeatures } from "../src/db/schema";

export async function up(db: any) {
  // Insert default plans
  await db.execute(sql`
    INSERT INTO plans (name, type, price, features, created_at, updated_at)
    VALUES 
      (
        'Free',
        'free',
        0,
        '{"articleLimit": 3, "customBranding": false, "prioritySupport": false, "analytics": false, "apiAccess": false}'::jsonb,
        NOW(),
        NOW()
      ),
      (
        'Starter',
        'starter',
        999, -- $9.99
        '{"articleLimit": 20, "customBranding": true, "prioritySupport": false, "analytics": true, "apiAccess": false}'::jsonb,
        NOW(),
        NOW()
      ),
      (
        'Unlimited',
        'unlimited',
        1999, -- $19.99
        '{"articleLimit": -1, "customBranding": true, "prioritySupport": true, "analytics": true, "apiAccess": true}'::jsonb,
        NOW(),
        NOW()
      )
  `);

  // Update existing users to have the free plan by default
  await db.execute(sql`
    UPDATE users 
    SET plan_id = (SELECT id FROM plans WHERE type = 'free' LIMIT 1)
    WHERE plan_id IS NULL
  `);
}

export async function down(db: any) {
  await db.execute(sql`DELETE FROM plans`);
}
