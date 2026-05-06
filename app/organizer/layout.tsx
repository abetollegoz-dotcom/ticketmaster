import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || (session.user.role !== "ORGANIZER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/");
  }

  return <>{children}</>;
}
