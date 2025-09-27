// Gunakan Prisma Client langsung tanpa adapter untuk seeding
import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting brand seeding...");

  try {
    // Clear existing brands
    await prisma.brand.deleteMany();
    console.log("✅ Cleared existing brands");

    // Create brands
    const brands = [
      {
        name: "The Night Shift",
        slug: "the-night-shift",
        description: "Premium streetwear brand for the night owls",
        logoUrl: "/placeholder-logo.svg",
        isActive: true,
      },
      {
        name: "Urban Legends",
        slug: "urban-legends",
        description: "Street culture inspired clothing",
        logoUrl: "/placeholder-logo.svg",
        isActive: true,
      },
      {
        name: "Midnight Co.",
        slug: "midnight-co",
        description: "Dark aesthetic fashion brand",
        logoUrl: "/placeholder-logo.svg",
        isActive: true,
      },
    ];

    for (const brand of brands) {
      const createdBrand = await prisma.brand.create({
        data: brand,
      });
      console.log(`✅ Created brand: ${createdBrand.name}`);
    }

    console.log("🎉 Brand seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
