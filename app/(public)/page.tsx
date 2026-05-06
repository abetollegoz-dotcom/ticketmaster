import { prisma } from "@/lib/prisma";
import { HomeHero } from "@/components/sections/home-hero";
import { TrendingEvents } from "@/components/sections/trending-events";
import { CategoryGrid } from "@/components/sections/category-grid";
import { FeaturedEvents } from "@/components/sections/featured-events";
import { StatsBar } from "@/components/sections/stats-bar";
import { HowItWorks } from "@/components/sections/how-it-works";
import { TestimonialsSection } from "@/components/sections/testimonials";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EventHub Pro — Discover Live Events Near You",
  description:
    "Buy tickets to concerts, sports, theatre, festivals and more. Secure digital tickets with QR codes. Trusted by millions worldwide.",
};

// ISR: revalidate every 5 minutes
export const revalidate = 300;

async function getHomeData() {
  const [featuredEvents, trendingEvents, categories, stats] = await Promise.all([
    prisma.event.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      take: 4,
      include: {
        venue: { select: { name: true, city: true, country: true } },
        category: { select: { name: true, slug: true, color: true } },
        dates: { take: 1, orderBy: { startDate: "asc" } },
        ticketTypes: { where: { isVisible: true }, select: { price: true, name: true } },
        _count: { select: { favorites: true } },
      },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.event.findMany({
      where: { status: "PUBLISHED", isTrending: true },
      take: 8,
      include: {
        venue: { select: { name: true, city: true, country: true } },
        category: { select: { name: true, slug: true, color: true } },
        dates: { take: 1, orderBy: { startDate: "asc" } },
        ticketTypes: { where: { isVisible: true }, select: { price: true, name: true } },
        _count: { select: { favorites: true } },
      },
      orderBy: { totalSales: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.$transaction([
      prisma.event.count({ where: { status: "PUBLISHED" } }),
      prisma.order.count({ where: { status: "CONFIRMED" } }),
      prisma.user.count(),
      prisma.venue.count(),
    ]),
  ]);

  return {
    featuredEvents,
    trendingEvents,
    categories,
    stats: {
      events: stats[0],
      tickets: stats[1],
      users: stats[2],
      venues: stats[3],
    },
  };
}

export default async function HomePage() {
  const { featuredEvents, trendingEvents, categories, stats } = await getHomeData();

  return (
    <>
      <HomeHero />
      <StatsBar stats={stats} />
      <FeaturedEvents events={featuredEvents as never} />
      <CategoryGrid categories={categories} />
      <TrendingEvents events={trendingEvents as never} />
      <HowItWorks />
      <TestimonialsSection />
    </>
  );
}
