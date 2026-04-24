import { auth } from "@valora/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DebtForm } from "@/features/debts/components/debt-form";
import { listRelatedPeople } from "@/features/debts/data/related-people.repo";

export default async function NewDebtPage() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) redirect("/login");

	const relatedPeople = await listRelatedPeople(session.user.id);

	return (
		<div className="mx-auto w-full max-w-2xl space-y-6 p-6 lg:p-10">
			<header>
				<h1 className="font-semibold text-2xl tracking-tight">Nova dívida</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Cadastre despesas suas e também valores que outras pessoas te devem.
				</p>
			</header>
			<DebtForm relatedPeople={relatedPeople} />
		</div>
	);
}
