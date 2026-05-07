import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import NewEventForm from "./new-event-form";

export default async function NewEventPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ORGANIZER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login?callbackUrl=/organizer/events/new");
  }

  // Ensure OrganizerProfile exists, create if missing for Organizers/Admins
  let profile = await prisma.organizerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    const orgName = session.user.name || "My Organization";
    const baseSlug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    profile = await prisma.organizerProfile.create({
      data: {
        userId: session.user.id,
        organizationName: orgName,
        slug: slug,
        isApproved: true, // Auto-approve for now to unblock
      },
    });
  }

  const [venues, categories] = await Promise.all([
    prisma.venue.findMany({ select: { id: true, name: true, city: true } }),
    prisma.category.findMany({ select: { id: true, name: true } }),
  ]);

  return (
    <div className="container py-12 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
        <p className="text-secondary text-sm">Launch your next experience on EventHub Pro.</p>
      </div>
      <NewEventForm venues={venues} categories={categories} />
    </div>
  );
}
