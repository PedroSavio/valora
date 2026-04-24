import { DebtForm } from "@/features/debts/components/debt-form";
import { listRelatedPeople } from "@/features/debts/data/related-people.repo";
import { requireSession } from "@/lib/session";

export default async function NewDebtPage() {
	const session = await requireSession();
	const relatedPeople = await listRelatedPeople(session.user.id);

	return (
		<div className="mx-auto w-full max-w-2xl space-y-6 p-4 sm:p-6 lg:p-10">
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
