import { PrismaClient } from '../lib/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create connection pool for Neon DB with proper configuration
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false }
});

// Create adapter with proper type handling
const adapter = new PrismaNeon(pool as any);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seeding with Neon adapter...');

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
    try {
      const createdBrand = await prisma.brand.create({
        data: brand,
      });
      console.log(`Created brand: ${createdBrand.name}`);
    } catch (error) {
      console.log(`Brand ${brand.name} might already exist`);
    }
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
    try {
      const createdCategory = await prisma.category.create({
        data: category,
      });
      console.log(`Created category: ${createdCategory.name}`);
    } catch (error) {
      console.log(`Category ${category.name} might already exist`);
    }
  }

  console.log('Seeding completed!');
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