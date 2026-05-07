export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ORGANIZER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return apiError("Unauthorized", 403);
  }

  const { id } = await params;
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
  const { title, description, status, dates, ticketTypes, fallbackProvider, postponeReason } = body;

  // Postpone requires new dates
  if (status === "POSTPONED" && (!dates || !Array.isArray(dates) || dates.length === 0)) {
    return apiError("New dates are required when postponing an event", 400);
  }

  const updateData: any = {};
  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (status) updateData.status = status;
  if (fallbackProvider !== undefined) updateData.fallbackProvider = fallbackProvider || null;
  if (postponeReason) updateData.notes = postponeReason;

  // Handle Event Dates (Postponing / Rescheduling)
  if (dates && Array.isArray(dates)) {
    await prisma.eventDate.deleteMany({ where: { eventId: id } });
    updateData.dates = {
      create: dates.map((d: any) => ({
        startDate: new Date(d.startDate),
        endDate: new Date(d.endDate),
        isMainDate: d.isMainDate ?? false,
        timezone: d.timezone || "UTC",
      })),
    };
  }

  // Handle Ticket Types (Pricing, originalPrice)
  if (ticketTypes && Array.isArray(ticketTypes)) {
    for (const tt of ticketTypes) {
      if (tt.id) {
        await prisma.ticketType.update({
          where: { id: tt.id },
          data: {
            name: tt.name,
            price: tt.price,
            originalPrice: tt.originalPrice ?? null,
            quantity: tt.quantity,
          },
        });
      } else {
        await prisma.ticketType.create({
          data: {
            eventId: id,
            name: tt.name,
            price: tt.price,
            originalPrice: tt.originalPrice ?? null,
            quantity: tt.quantity,
          },
        });
      }
    }
  }

  const updatedEvent = await prisma.event.update({
    where: { id },
    data: updateData,
    include: { dates: true, ticketTypes: true },
  });

  return apiSuccess(updatedEvent);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ORGANIZER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return apiError("Unauthorized", 403);
  }

  const { id } = await params;
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
