-- Add village column with default value first
ALTER TABLE "addresses" ADD COLUMN "village" text DEFAULT '';

-- Update existing rows to have empty string
UPDATE "addresses" SET "village" = '' WHERE "village" IS NULL;

-- Make it NOT NULL after data is populated
ALTER TABLE "addresses" ALTER COLUMN "village" SET NOT NULL;

-- Remove default constraint
ALTER TABLE "addresses" ALTER COLUMN "village" DROP DEFAULT;
