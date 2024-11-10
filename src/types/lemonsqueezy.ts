export interface LemonSqueezyWebhookEvent {
  meta: {
    event_name:
      | "subscription_created"
      | "subscription_updated"
      | "subscription_cancelled"
      | "subscription_resumed"
      | "subscription_expired"
      | "subscription_paused"
      | "subscription_unpaused"
      | "subscription_payment_success"
      | "subscription_payment_failed"
      | "subscription_payment_recovered";
    custom_data?: {
      userId?: string;
      planId?: number;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      store_id: number;
      customer_id: number;
      order_id: number;
      product_id: number;
      variant_id: number;
      product_name: string;
      variant_name: string;
      user_name: string | null;
      user_email: string | null;
      status: "active" | "cancelled" | "expired" | "paused" | "past_due";
      status_formatted: string;
      pause_starts_at: string | null;
      pause_ends_at: string | null;
      cancelled_at: string | null;
      trial_ends_at: string | null;
      billing_anchor: number;
      urls: {
        update_payment_method: string;
        customer_portal: string;
      };
      renews_at: string | null;
      ends_at: string | null;
      created_at: string;
      updated_at: string;
      test_mode: boolean;
      card_brand: string | null;
      card_last_four: string | null;
      current_period_start: string;
      current_period_end: string;
    };
  };
}
