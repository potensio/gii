/*
  Warnings:

  - The values [DISCONTINUED,OUT_OF_STOCK] on the enum `ProductStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [SCREEN_SIZE,CONNECTIVITY,OTHER] on the enum `VariantAttributeType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `popularity` on the `products` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ProductStatus_new" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');
ALTER TABLE "public"."products" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."products" ALTER COLUMN "status" TYPE "public"."ProductStatus_new" USING ("status"::text::"public"."ProductStatus_new");
ALTER TYPE "public"."ProductStatus" RENAME TO "ProductStatus_old";
ALTER TYPE "public"."ProductStatus_new" RENAME TO "ProductStatus";
DROP TYPE "public"."ProductStatus_old";
ALTER TABLE "public"."products" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."VariantAttributeType_new" AS ENUM ('COLOR', 'SIZE', 'STORAGE', 'MEMORY', 'PROCESSOR', 'MATERIAL', 'CAPACITY', 'MODEL', 'DIMENSION', 'FEATURE');
ALTER TABLE "public"."variant_attributes" ALTER COLUMN "type" TYPE "public"."VariantAttributeType_new" USING ("type"::text::"public"."VariantAttributeType_new");
ALTER TYPE "public"."VariantAttributeType" RENAME TO "VariantAttributeType_old";
ALTER TYPE "public"."VariantAttributeType_new" RENAME TO "VariantAttributeType";
DROP TYPE "public"."VariantAttributeType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."product_images" ADD COLUMN     "filename" TEXT,
ADD COLUMN     "originalName" TEXT,
ADD COLUMN     "size" INTEGER,
ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "public"."products" DROP COLUMN "popularity";
