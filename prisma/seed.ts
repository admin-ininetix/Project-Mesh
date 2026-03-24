import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminHash = await bcrypt.hash("Admin1234!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@projectmesh.de" },
    update: {},
    create: {
      email: "admin@projectmesh.de",
      username: "admin",
      passwordHash: adminHash,
      role: "admin",
      profile: {
        create: {
          displayName: "Admin",
          bio: "Project Mesh Administrator",
        },
      },
    },
  });
  console.log("✅ Admin user:", admin.username);

  // Create demo user
  const demoHash = await bcrypt.hash("Demo1234!", 12);
  const demo = await prisma.user.upsert({
    where: { email: "demo@projectmesh.de" },
    update: {},
    create: {
      email: "demo@projectmesh.de",
      username: "demo_user",
      passwordHash: demoHash,
      role: "user",
      profile: {
        create: {
          displayName: "Demo User",
          bio: "Ich bin ein Demo-Nutzer auf Project Mesh. 👋",
          location: "Berlin, Deutschland",
        },
      },
    },
  });
  console.log("✅ Demo user:", demo.username);

  // Create communities
  const communities = [
    {
      name: "Allgemein",
      slug: "allgemein",
      description: "Allgemeine Diskussionen und Neuigkeiten",
    },
    {
      name: "Technik",
      slug: "technik",
      description: "Alles rund um Technologie, Programmierung und Gadgets",
    },
    {
      name: "Fotografie",
      slug: "fotografie",
      description: "Teile deine besten Fotos und Tipps",
    },
  ];

  for (const c of communities) {
    const community = await prisma.community.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        ...c,
        memberships: {
          create: {
            userId: admin.id,
            role: "owner",
          },
        },
      },
    });
    console.log("✅ Community:", community.name);
  }

  // Create sample posts
  const allgemein = await prisma.community.findUnique({ where: { slug: "allgemein" } });

  if (allgemein) {
    await prisma.communityMembership.upsert({
      where: { userId_communityId: { userId: demo.id, communityId: allgemein.id } },
      update: {},
      create: { userId: demo.id, communityId: allgemein.id, role: "member" },
    });

    const post1 = await prisma.post.create({
      data: {
        authorId: demo.id,
        communityId: allgemein.id,
        content:
          "Herzlich willkommen bei Project Mesh! 🎉\n\nDas ist unsere neue Community-Plattform. Hier könnt ihr euch austauschen, Posts erstellen und Communities beitreten.\n\nViel Spaß beim Entdecken!",
      },
    });

    await prisma.post.create({
      data: {
        authorId: admin.id,
        communityId: allgemein.id,
        content:
          "Project Mesh ist jetzt live! 🚀\n\nUnsere Plattform ist öffentlich lesbar – jeder kann Posts und Communities ansehen, ohne sich anzumelden.\n\nMit einem Account kannst du:\n• Posts erstellen\n• Kommentieren und Liken\n• Communities beitreten\n• Anderen Nutzern folgen\n\nRegistriere dich jetzt und werde Teil der Community!",
      },
    });

    await prisma.like.create({
      data: { userId: admin.id, postId: post1.id },
    });

    await prisma.comment.create({
      data: {
        postId: post1.id,
        authorId: admin.id,
        content: "Willkommen! Ich freue mich, dass du dabei bist. 😊",
      },
    });
  }

  console.log("✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
