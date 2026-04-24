import { Sidebar } from "@/components/sidebar";
import { requireSession } from "@/lib/session";

export default async function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await requireSession();

	return (
		<div className="dark flex min-h-svh flex-col bg-background text-foreground lg:h-svh lg:flex-row">
			<Sidebar />
			<main className="flex-1 overflow-y-auto pb-20 lg:pb-0">{children}</main>
		</div>
	);
}
