import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Create sample users
  const users = [
    {
      name: "John Doe",
      email: "john@example.com",
      role: "ADMIN" as const,
      status: "ACTIVE" as const,
      avatar: "/avatars/john.jpg",
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      role: "USER" as const,
      status: "ACTIVE" as const,
      avatar: "/avatars/jane.jpg",
    },
    {
      name: "Bob Wilson",
      email: "bob@example.com",
      role: "MODERATOR" as const,
      status: "INACTIVE" as const,
      avatar: "/avatars/bob.jpg",
    },
    {
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "USER" as const,
      status: "SUSPENDED" as const,
      avatar: "/avatars/alice.jpg",
    },
    {
      name: "Charlie Brown",
      email: "charlie@example.com",
      role: "USER" as const,
      status: "ACTIVE" as const,
      avatar: "/avatars/charlie.jpg",
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
