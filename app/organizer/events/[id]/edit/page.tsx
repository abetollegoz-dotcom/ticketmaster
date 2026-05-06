import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import EventEditForm from "./event-edit-form";

export default async function OrganizerEventEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ORGANIZER") {
    redirect("/login");
  }

  const profile = await prisma.organizerProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/organizer");

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      dates: true,
      ticketTypes: true,
      venue: true,
    },
  });

  if (!event || event.organizerId !== profile.id) {
    redirect("/organizer");
  }

  // Pass necessary event data to a client component
  const initialData = {
    id: event.id,
    title: event.title,
    description: event.description,
    status: event.status,
    dates: event.dates,
    ticketTypes: event.ticketTypes,
  };

  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Edit Event</h1>
      <EventEditForm initialData={initialData} />
    </div>
  );
}
