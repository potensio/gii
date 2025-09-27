import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Gunakan connection string langsung dengan PrismaPg
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting brand seeding...");

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
    },
    {
      name: "Urban Legends",
      slug: "urban-legends",
      description: "Street culture inspired clothing",
      logoUrl: "/placeholder-logo.svg",
    },
    {
      name: "Midnight Co.",
      slug: "midnight-co",
      description: "Dark aesthetic fashion brand",
      logoUrl: "/placeholder-logo.svg",
    },
  ];

  for (const brand of brands) {
    const createdBrand = await prisma.brand.create({
      data: brand,
    });
    console.log(`✅ Created brand: ${createdBrand.name}`);
  }

  console.log("🎉 Brand seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
