import { Sidebar } from "@/components/sidebar";
import { requireSession } from "@/lib/session";

export default async function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await requireSession();

	return (
		<div className="dark flex h-svh bg-background text-foreground">
			<Sidebar />
			<main className="flex-1 overflow-y-auto">{children}</main>
		</div>
	);
}
