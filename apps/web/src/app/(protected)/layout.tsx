import { auth } from "@valora/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Sidebar } from "@/components/sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="dark flex h-svh bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
