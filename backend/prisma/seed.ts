import { PrismaClient, Role, TicketStatus, Priority, Category } from "@prisma/client";
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
  const items = JSON.parse(rawData);

  // Separate users and tickets from the seed array
  const userItems = items.filter((item: any) => item.email && item.password);
  const ticketItems = items.filter((item: any) => item.title && item.description);

  const userEmailToIdMap = new Map<string, number>();

  for (const u of userItems) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const roleValue = (u.role && u.role.toLowerCase() === "admin") ? Role.admin : Role.agent;

    const upsertedUser = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        passwordHash,
        role: roleValue,
      },
      create: {
        name: u.name,
        email: u.email,
        passwordHash,
        role: roleValue,
      },
    });

    userEmailToIdMap.set(upsertedUser.email, upsertedUser.id);
  }

  for (const t of ticketItems) {
    const createdById = t.createdEmail ? userEmailToIdMap.get(t.createdEmail) : undefined;
    if (!createdById) {
      console.warn(`Skipping ticket "${t.title}" because creator email was not found.`);
      continue;
    }

    const assignedToId = t.assignedEmail ? userEmailToIdMap.get(t.assignedEmail) : null;

    await prisma.ticket.create({
      data: {
        title: t.title,
        description: t.description,
        status: (t.status as TicketStatus) || TicketStatus.open,
        priority: (t.priority as Priority) || null,
        category: (t.category as Category) || null,
        tags: t.tags || [],
        createdById,
        assignedToId,
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
