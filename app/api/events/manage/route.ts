export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ORGANIZER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return apiError("Unauthorized", 403);
  }

  const body = await req.json();
  const { title, description, venueId, categoryId, fallbackProvider, dates, ticketTypes } = body;

  if (!title || !description || !dates || dates.length === 0 || !ticketTypes || ticketTypes.length === 0) {
    return apiError("Missing required fields", 400);
  }

  // Ensure OrganizerProfile exists for ORGANIZER
  let organizerId = "";
  if (session.user.role === "ORGANIZER") {
    const profile = await prisma.organizerProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return apiError("Organizer profile not found", 404);
    organizerId = profile.id;
  } else {
    // For admins, just pick the first organizer or require it in body (mock logic for now)
    const firstOrg = await prisma.organizerProfile.findFirst();
    if (!firstOrg) return apiError("No organizer profiles exist in the system", 400);
    organizerId = firstOrg.id;
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);

  const event = await prisma.event.create({
    data: {
      title,
      slug,
      description,
      venueId,
      categoryId,
      organizerId,
      fallbackProvider: fallbackProvider || null,
      status: "PUBLISHED",
      dates: {
        create: dates.map((d: any) => ({
          startDate: new Date(d.startDate),
          endDate: new Date(d.endDate),
        })),
      },
      ticketTypes: {
        create: ticketTypes.map((t: any) => ({
          name: t.name,
          category: t.category || "GENERAL",
          price: t.price,
          originalPrice: t.originalPrice || null,
          quantity: t.quantity,
        })),
      },
    },
  });

  return apiSuccess(event);
}
