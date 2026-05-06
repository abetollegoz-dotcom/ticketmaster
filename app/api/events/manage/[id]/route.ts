export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ORGANIZER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return apiError("Unauthorized", 403);
  }

  const { id } = params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { organizer: true },
  });

  if (!event) return apiError("Event not found", 404);

  if (session.user.role === "ORGANIZER") {
    const profile = await prisma.organizerProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile || event.organizerId !== profile.id) {
      return apiError("Unauthorized to edit this event", 403);
    }
  }

  const body = await req.json();
  const { title, description, status, dates, ticketTypes } = body;

  const updateData: any = {};
  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (status) updateData.status = status;

  // Handle Event Dates (Postponing)
  if (dates && Array.isArray(dates)) {
    // Delete old dates and recreate
    await prisma.eventDate.deleteMany({ where: { eventId: id } });
    updateData.dates = {
      create: dates.map((d: any) => ({
        startDate: new Date(d.startDate),
        endDate: new Date(d.endDate),
        isMainDate: d.isMainDate || false,
      })),
    };
  }

  // Handle Ticket Types (Pricing)
  if (ticketTypes && Array.isArray(ticketTypes)) {
    // Only updating existing or adding new. Simplified: delete and recreate if no tickets sold.
    // For safety, we should only update prices if tickets exist, but for now we'll allow updating price.
    for (const tt of ticketTypes) {
      if (tt.id) {
        await prisma.ticketType.update({
          where: { id: tt.id },
          data: {
            name: tt.name,
            price: tt.price,
            quantity: tt.quantity,
          },
        });
      } else {
        await prisma.ticketType.create({
          data: {
            eventId: id,
            name: tt.name,
            price: tt.price,
            quantity: tt.quantity,
          },
        });
      }
    }
  }

  const updatedEvent = await prisma.event.update({
    where: { id },
    data: updateData,
  });

  return apiSuccess(updatedEvent);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ORGANIZER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return apiError("Unauthorized", 403);
  }

  const { id } = params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { orderItems: true } } },
  });

  if (!event) return apiError("Event not found", 404);

  if (session.user.role === "ORGANIZER") {
    const profile = await prisma.organizerProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile || event.organizerId !== profile.id) {
      return apiError("Unauthorized to delete this event", 403);
    }
  }

  // Soft delete / cancel if orders exist
  if (event._count.orderItems > 0) {
    const updated = await prisma.event.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
    return apiSuccess({ message: "Event cancelled due to existing orders", event: updated });
  }

  // Hard delete if no orders
  await prisma.event.delete({ where: { id } });
  return apiSuccess({ message: "Event permanently deleted" });
}
