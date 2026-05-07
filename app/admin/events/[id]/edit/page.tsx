import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EventEditForm from "@/app/organizer/events/[id]/edit/event-edit-form";

export default async function AdminEventEditPage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      dates: true,
      ticketTypes: true,
    },
  });

  if (!event) notFound();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Platform Override: {event.title}</h1>
        <p className="text-secondary text-sm">Admins can override all event details, pricing, and status regardless of organizer constraints.</p>
      </div>
      
      <EventEditForm initialData={event} />
    </div>
  );
}
