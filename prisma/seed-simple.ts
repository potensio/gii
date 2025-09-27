import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Seed brands
  const brands = [
    {
      name: "The Night Shift",
      slug: "the-night-shift",
      description: "Premium streetwear brand for the night owls",
      logoUrl: "/placeholder-logo.svg",
    },
    {
      name: "Urban Afterdark",
      slug: "urban-afterdark",
      description: "Street culture inspired clothing",
      logoUrl: "/placeholder-logo.svg",
    },
    {
      name: "Nocturne Style",
      slug: "nocturne-style",
      description: "Dark aesthetic fashion brand",
      logoUrl: "/placeholder-logo.svg",
    },
  ];

  for (const brand of brands) {
    const createdBrand = await prisma.brand.create({
      data: brand,
    });
    console.log(`Created brand: ${createdBrand.name}`);
  }

  // Seed categories
  const categories = [
    {
      name: "T-Shirts",
      slug: "t-shirts",
      description: "Premium cotton t-shirts",
    },
    {
      name: "Hoodies",
      slug: "hoodies",
      description: "Comfortable hoodies and sweatshirts",
    },
    {
      name: "Accessories",
      slug: "accessories",
      description: "Streetwear accessories",
    },
  ];

  for (const category of categories) {
    const createdCategory = await prisma.category.create({
      data: category,
    });
    console.log(`Created category: ${createdCategory.name}`);
  }

  console.log("Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
