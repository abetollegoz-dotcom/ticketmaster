import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import EventEditForm from "@/app/organizer/events/[id]/edit/event-edit-form";

export default async function AdminEventEditPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      dates: true,
      ticketTypes: true,
      venue: true,
    },
  });

  if (!event) {
    redirect("/admin");
  }

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
      <h1 className="text-3xl font-bold mb-8">Admin: Edit Event</h1>
      <EventEditForm initialData={initialData} />
    </div>
  );
}
