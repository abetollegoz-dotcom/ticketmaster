export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

// PATCH /api/admin/events/[id] — Admin full event management
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return apiError("Unauthorized", 403);
  }

  const { id } = await params;
  const body = await req.json();
  const { status, fallbackProvider, isFeatured, isTrending, ticketTypes } = body;

  const validStatuses = ["PUBLISHED", "CANCELLED", "SUSPENDED", "DRAFT", "PENDING_APPROVAL", "POSTPONED", "COMPLETED"];
  if (status && !validStatuses.includes(status)) {
    return apiError("Invalid status", 400);
  }

  const validProviders = ["STRIPE", "PAYPAL", "MOLLIE", null];
  if (fallbackProvider !== undefined && !validProviders.includes(fallbackProvider)) {
    return apiError("Invalid payment provider", 400);
  }

  try {
    const updateData: any = {};
    if (status !== undefined) {
      updateData.status = status;
      if (status === "PUBLISHED") updateData.publishedAt = new Date();
    }
    if (fallbackProvider !== undefined) updateData.fallbackProvider = fallbackProvider;
    if (typeof isFeatured === "boolean") updateData.isFeatured = isFeatured;
    if (typeof isTrending === "boolean") updateData.isTrending = isTrending;

    // Update ticket type prices if provided
    if (ticketTypes && Array.isArray(ticketTypes)) {
      for (const tt of ticketTypes) {
        if (tt.id) {
          await prisma.ticketType.update({
            where: { id: tt.id },
            data: {
              price: tt.price,
              originalPrice: tt.originalPrice ?? null,
            },
          });
        }
      }
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: { ticketTypes: true, dates: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "admin_event_update",
        resource: "Event",
        resourceId: id,
        newData: updateData,
      },
    });

    return apiSuccess(event);
  } catch (error: any) {
    return apiError("Failed to update event: " + error.message, 500);
  }
}
