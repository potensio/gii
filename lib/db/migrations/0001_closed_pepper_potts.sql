ALTER TABLE "product_groups" ADD COLUMN "images" text;--> statement-breakpoint
ALTER TABLE "product_groups" ADD COLUMN "is_highlighted" boolean DEFAULT false NOT NULL;