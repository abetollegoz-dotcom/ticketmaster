const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Admin
  const adminHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@eventhub.pro" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@eventhub.pro",
      password: adminHash,
      role: "SUPER_ADMIN",
    }
  });

  // 2. Create Organizer
  const orgHash = await bcrypt.hash("org123", 12);
  const orgUser = await prisma.user.upsert({
    where: { email: "organizer@events.com" },
    update: {},
    create: {
      name: "Alex Organizer",
      email: "organizer@events.com",
      password: orgHash,
      role: "ORGANIZER",
    }
  });

  const orgProfile = await prisma.organizerProfile.upsert({
    where: { userId: orgUser.id },
    update: {},
    create: {
      userId: orgUser.id,
      organizationName: "Global Events Ltd",
      slug: "global-events",
      isApproved: true,
      isVerified: true,
    }
  });

  // 3. Create Categories
  const categories = [
    { name: "Music", slug: "music", color: "#8b5cf6" },
    { name: "Sports", slug: "sports", color: "#3b82f6" },
    { name: "Comedy", slug: "comedy", color: "#f59e0b" },
    { name: "Tech", slug: "tech", color: "#10b981" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    });
  }

  // 4. Create Venue
  const venue = await prisma.venue.upsert({
    where: { slug: "madison-square-garden" },
    update: {},
    create: {
      name: "Madison Square Garden",
      slug: "madison-square-garden",
      address: "4 Pennsylvania Plaza",
      city: "New York",
      country: "USA",
      capacity: 20000,
    }
  });

  // 5. Create Event
  const musicCat = await prisma.category.findUnique({ where: { slug: "music" } });
  
  const event = await prisma.event.upsert({
    where: { slug: "summer-beats-2024" },
    update: {},
    create: {
      title: "Summer Beats Festival 2024",
      slug: "summer-beats-2024",
      description: "Join us for the biggest music festival of the summer!",
      shortDesc: "The ultimate summer music experience.",
      organizerId: orgProfile.id,
      categoryId: musicCat.id,
      venueId: venue.id,
      status: "PUBLISHED",
      isFeatured: true,
      isTrending: true,
      publishedAt: new Date(),
      images: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      dates: {
        create: [
          {
            startDate: new Date("2024-08-15T18:00:00Z"),
            endDate: new Date("2024-08-15T23:00:00Z"),
            isMainDate: true,
          }
        ]
      },
      ticketTypes: {
        create: [
          { name: "General Admission", price: 89.00, quantity: 500, category: "GENERAL" },
          { name: "VIP Experience", price: 249.00, quantity: 100, category: "VIP" },
          { name: "Early Bird", price: 59.00, quantity: 200, category: "EARLY_BIRD" },
        ]
      }
    }
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
