import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EventDetailClient } from "@/components/event/event-detail-client";
import type { Metadata } from "next";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug }, select: { title: true, shortDesc: true, images: true, metaTitle: true, metaDesc: true } });
  if (!event) return { title: "Event Not Found" };
  return {
    title: event.metaTitle || event.title,
    description: event.metaDesc || event.shortDesc || "",
    openGraph: { title: event.title, description: event.shortDesc || "", images: event.images[0] ? [event.images[0]] : [] },
  };
}

export const revalidate = 60;

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      venue: true,
      category: true,
      dates: { orderBy: { startDate: "asc" } },
      ticketTypes: { where: { isVisible: true }, orderBy: { sortOrder: "asc" } },
      organizer: { select: { organizationName: true, slug: true, logo: true, isVerified: true, description: true } },
      reviews: { where: { isVisible: true }, include: { user: { select: { name: true, image: true } } }, orderBy: { createdAt: "desc" }, take: 8 },
      _count: { select: { favorites: true, reviews: true } },
    },
  });

  if (!event) notFound();

  // Related events
  const related = await prisma.event.findMany({
    where: { status: "PUBLISHED", categoryId: event.categoryId, id: { not: event.id } },
    take: 4,
    include: {
      venue: { select: { name: true, city: true, country: true } },
      category: { select: { name: true, slug: true, color: true } },
      dates: { take: 1, orderBy: { startDate: "asc" } },
      ticketTypes: { where: { isVisible: true }, select: { price: true, name: true } },
      _count: { select: { favorites: true } },
    },
  });

  // Increment views (fire & forget)
  prisma.event.update({ where: { id: event.id }, data: { totalViews: { increment: 1 } } }).catch(() => {});

  return <EventDetailClient event={event as never} related={related as never} />;
}
