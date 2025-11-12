ALTER TABLE "product_groups" ADD COLUMN "slug" text NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE "product_groups" ADD CONSTRAINT "product_groups_slug_unique" UNIQUE("slug");
