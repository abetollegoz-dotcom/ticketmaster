import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Settings, Building2, Globe, Mail, Phone, Camera, Save } from "lucide-react";
import SettingsForm from "./settings-form";

export default async function OrganizerSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await prisma.organizerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) redirect("/organizer");

  return (
    <div className="container py-12 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Business Profile</h1>
        <p className="text-secondary">Manage your organization's public identity and contact details.</p>
      </div>

      <SettingsForm profile={profile} />
    </div>
  );
}
