import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminHash = await hash('admin1234', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@projectmesh.app' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@projectmesh.app',
      passwordHash: adminHash,
      displayName: 'Project Mesh Admin',
      bio: 'The official Project Mesh admin account.',
      role: 'ADMIN',
    },
  })

  // Create demo user
  const userHash = await hash('demo1234', 12)
  const demo = await prisma.user.upsert({
    where: { email: 'demo@projectmesh.app' },
    update: {},
    create: {
      username: 'demouser',
      email: 'demo@projectmesh.app',
      passwordHash: userHash,
      displayName: 'Demo User',
      bio: 'Just trying out Project Mesh!',
    },
  })

  // Create communities
  const techCommunity = await prisma.community.upsert({
    where: { slug: 'tech-talk' },
    update: {},
    create: {
      name: 'Tech Talk',
      slug: 'tech-talk',
      description: 'Discussions about technology, programming, and the future.',
      members: {
        create: [
          { userId: admin.id, role: 'OWNER' },
          { userId: demo.id, role: 'MEMBER' },
        ],
      },
    },
  })

  const generalCommunity = await prisma.community.upsert({
    where: { slug: 'general' },
    update: {},
    create: {
      name: 'General',
      slug: 'general',
      description: 'General discussions about anything and everything.',
      members: {
        create: [
          { userId: admin.id, role: 'OWNER' },
          { userId: demo.id, role: 'MEMBER' },
        ],
      },
    },
  })

  // Create sample posts
  const posts = [
    {
      content: 'Welcome to Project Mesh! 🌐 This is an open social platform for sharing ideas, building communities, and connecting with people who matter.',
      authorId: admin.id,
    },
    {
      content: 'Just posted my first update on Project Mesh! Loving the clean interface and dark mode. The community features are really well thought out. 🚀',
      authorId: demo.id,
      communityId: generalCommunity.id,
    },
    {
      content: 'Hot take: TypeScript is the best thing to happen to JavaScript. The developer experience with Prisma + Next.js 14 is absolutely insane right now.',
      authorId: demo.id,
      communityId: techCommunity.id,
    },
    {
      content: 'Building in public is one of the most underrated growth strategies. Share your progress, failures, and wins. People root for authenticity.',
      authorId: admin.id,
      communityId: generalCommunity.id,
    },
  ]

  for (const post of posts) {
    await prisma.post.create({ data: post })
  }

  console.log('✅ Seed complete!')
  console.log(`   Admin: admin@projectmesh.app / admin1234`)
  console.log(`   Demo:  demo@projectmesh.app / demo1234`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
