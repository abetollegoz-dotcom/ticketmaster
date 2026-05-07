import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const profile = await prisma.organizerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) return apiError("Organizer profile not found", 404);

  const body = await req.json();
  const { organizationName, description, website, phone } = body;

  const updated = await prisma.organizerProfile.update({
    where: { id: profile.id },
    data: {
      organizationName,
      description,
      website,
      phone,
    },
  });

  return apiSuccess(updated);
}
