-- Add Paystack fields to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS paystack_customer_code TEXT,
ADD COLUMN IF NOT EXISTS paystack_subscription_code TEXT,
ADD COLUMN IF NOT EXISTS paystack_reference TEXT;
