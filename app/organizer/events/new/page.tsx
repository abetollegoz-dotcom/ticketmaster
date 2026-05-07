import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import NewEventForm from "./new-event-form";

export default async function NewEventPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ORGANIZER") {
    redirect("/login");
  }

  const profile = await prisma.organizerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) redirect("/organizer");

  const [venues, categories] = await Promise.all([
    prisma.venue.findMany({ select: { id: true, name: true, city: true } }),
    prisma.category.findMany({ select: { id: true, name: true } }),
  ]);

  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
      <NewEventForm venues={venues} categories={categories} />
    </div>
  );
}
