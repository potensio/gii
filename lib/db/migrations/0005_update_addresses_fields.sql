-- Migration: Update addresses table fields
-- Remove phone_number and address_line_2, add district

-- Remove phone_number column
ALTER TABLE "addresses" DROP COLUMN IF EXISTS "phone_number";

-- Remove address_line_2 column
ALTER TABLE "addresses" DROP COLUMN IF EXISTS "address_line_2";

-- Add district column
ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "district" text NOT NULL DEFAULT '';

-- Remove default after adding column
ALTER TABLE "addresses" ALTER COLUMN "district" DROP DEFAULT;
