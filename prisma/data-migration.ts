import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Create the PostgreSQL adapter
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function migrateProductVariantNames() {
  console.log("Starting data migration for ProductVariant names...");

  try {
    // Get all products with their variants
    const products = await prisma.product.findMany({
      include: {
        variants: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    console.log(`Found ${products.length} products to migrate`);

    for (const product of products) {
      console.log(
        `Processing product: ${product.name} (${product.variants.length} variants)`
      );

      for (let i = 0; i < product.variants.length; i++) {
        const variant = product.variants[i];

        // Generate variant name based on whether it has attributes
        const variantAttributes = await prisma.variantAttribute.findMany({
          where: { variantId: variant.id },
        });

        let variantName: string;

        if (variantAttributes.length === 0) {
          // Simple product - use product name
          variantName = product.name;
        } else {
          // Complex product - combine attribute values
          const attributeValues = variantAttributes
            .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
            .map((attr: any) => attr.value)
            .join(" / ");
          variantName = `${product.name} - ${attributeValues}`;
        }

        // Update the variant with the generated name and set isDefault for first variant
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: {
            name: variantName,
            isDefault: i === 0, // Set first variant as default
          },
        });

        console.log(
          `  Updated variant: ${variantName} (isDefault: ${i === 0})`
        );
      }
    }

    console.log("Data migration completed successfully!");
  } catch (error) {
    console.error("Error during data migration:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateProductVariantNames()
  .then(() => {
    console.log("Migration script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });