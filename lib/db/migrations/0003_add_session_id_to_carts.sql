-- Migration: Add sessionId support to carts table for guest users
-- This allows guest users to have carts without requiring a user account

-- Make userId nullable to support guest carts
ALTER TABLE "carts" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint

-- Add sessionId field for guest cart identification
ALTER TABLE "carts" ADD COLUMN "session_id" text;--> statement-breakpoint

-- Add CHECK constraint to ensure at least one identifier exists
ALTER TABLE "carts" ADD CONSTRAINT "carts_identifier_check" CHECK ("user_id" IS NOT NULL OR "session_id" IS NOT NULL);--> statement-breakpoint

-- Add index on sessionId for efficient guest cart lookups
CREATE INDEX IF NOT EXISTS "cart_session_id_idx" ON "carts" USING btree ("session_id") WHERE "session_id" IS NOT NULL;
