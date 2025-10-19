CREATE TYPE "public"."verify_type" AS ENUM('register', 'reset_password');--> statement-breakpoint
CREATE TABLE "verify_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"verify_type" "verify_type" NOT NULL,
	"code" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "verify_codes" ADD CONSTRAINT "verify_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;