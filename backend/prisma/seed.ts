import { PrismaClient, Role, TicketStatus, Priority, Category, EnrichmentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const seedFilePath = path.join(__dirname, "tickets-seed.json");
  if (!fs.existsSync(seedFilePath)) {
    console.log("No tickets-seed.json found. Skipping seed.");
    return;
  }

  const rawData = fs.readFileSync(seedFilePath, "utf-8");
  const seedData = JSON.parse(rawData);

  const userItems = seedData.users || [];
  const ticketItems = seedData.tickets || [];

  // 1. Clean existing records in correct order to avoid foreign key violations
  console.log("Cleaning existing tickets and users...");
  await prisma.ticket.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Insert users
  console.log(`Inserting ${userItems.length} users...`);
  for (const u of userItems) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const roleValue = (u.role && u.role.toLowerCase() === "admin") ? Role.admin : Role.agent;

    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash,
        role: roleValue,
      },
    });
  }

  // 3. Insert tickets
  console.log(`Inserting ${ticketItems.length} tickets...`);
  for (const t of ticketItems) {
    await prisma.ticket.create({
      data: {
        id: t.id,
        title: t.title,
        description: t.description,
        status: (t.status as TicketStatus) || TicketStatus.open,
        priority: (t.priority as Priority) || null,
        category: (t.category as Category) || null,
        tags: t.tags || [],
        suggestedReply: t.suggestedReply || null,
        enrichmentStatus: (t.enrichmentStatus as EnrichmentStatus) || EnrichmentStatus.pending,
        enrichedAt: t.enrichedAt ? new Date(t.enrichedAt) : null,
        createdById: t.createdBy,
        assignedToId: t.assignedTo || null,
        createdAt: t.createdAt ? new Date(t.createdAt) : undefined,
        updatedAt: t.updatedAt ? new Date(t.updatedAt) : undefined,
      },
    });
  }

  console.log("Database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

