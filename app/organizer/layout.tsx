import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrganizerSidebar } from "@/components/layout/organizer-sidebar";

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || (session.user.role !== "ORGANIZER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-[#050510] text-white">
      <OrganizerSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
