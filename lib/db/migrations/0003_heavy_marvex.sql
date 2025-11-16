ALTER TABLE "carts" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "address_label" text NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "village" text NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "district" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "variant_selections" text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "session_id" text;--> statement-breakpoint
ALTER TABLE "product_groups" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
CREATE INDEX "cart_session_id_idx" ON "carts" USING btree ("session_id");--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "recipient_name";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "phone_number";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "address_line_2";--> statement-breakpoint
ALTER TABLE "product_groups" ADD CONSTRAINT "product_groups_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_identifier_check" CHECK ("carts"."user_id" IS NOT NULL OR "carts"."session_id" IS NOT NULL);