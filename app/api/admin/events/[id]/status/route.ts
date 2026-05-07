import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

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
  const { status } = body;

  const validStatuses = ["PUBLISHED", "CANCELLED", "SUSPENDED", "DRAFT", "PENDING_APPROVAL"];
  if (!validStatuses.includes(status)) {
    return apiError("Invalid status", 400);
  }

  try {
    const event = await prisma.event.update({
      where: { id },
      data: { 
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : undefined
      },
    });

    return apiSuccess(event);
  } catch (error: any) {
    return apiError("Failed to update status", 500);
  }
}
