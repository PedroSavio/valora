import { notFound } from "next/navigation";

import { DebtForm } from "@/features/debts/components/debt-form";
import { getDebtById } from "@/features/debts/data/debts.repo";
import { listRelatedPeople } from "@/features/debts/data/related-people.repo";
import { requireSession } from "@/lib/session";

export default async function EditDebtPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const session = await requireSession();

	const [debt, relatedPeople] = await Promise.all([
		getDebtById(session.user.id, id),
		listRelatedPeople(session.user.id),
	]);
	if (!debt) notFound();

	return (
		<div className="mx-auto w-full max-w-2xl space-y-6 p-6 lg:p-10">
			<header>
				<h1 className="font-semibold text-2xl tracking-tight">Editar dívida</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Atualize os dados do registro.
				</p>
			</header>
			<DebtForm
				mode="edit"
				debtId={debt.id}
				relatedPeople={relatedPeople}
				initialValues={{
					title: debt.title,
					amount: debt.amount,
					category: debt.category,
					type: debt.type,
					recurrence: debt.recurrence,
					direction: debt.direction,
					personId: debt.personId,
					personName: "",
					children: debt.children,
					dueDate: debt.dueDate,
					notes: debt.notes,
				}}
			/>
		</div>
	);
}
