require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const venues = await prisma.venue.count();
  const categories = await prisma.category.count();
  const organizers = await prisma.organizerProfile.count();
  const events = await prisma.event.count();
  console.log({ venues, categories, organizers, events });
  process.exit(0);
}

check();
