import { notFound } from "next/navigation";

import { IncomeForm } from "@/features/incomes/components/income-form";
import { getIncomeById } from "@/features/incomes/data/incomes.repo";
import { requireSession } from "@/lib/session";

const DEFAULT_PJ_TAX_RATE = 6;

export default async function EditIncomePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const session = await requireSession();

	const income = await getIncomeById(session.user.id, id);
	if (!income) notFound();

	return (
		<div className="mx-auto w-full max-w-2xl space-y-6 p-4 sm:p-6 lg:p-10">
			<header>
				<h1 className="font-semibold text-2xl tracking-tight">
					Editar entrada
				</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Atualize os dados do recebimento.
				</p>
			</header>
			<IncomeForm
				mode="edit"
				incomeId={income.id}
				initialValues={{
					type: income.type,
					amount: income.amount,
					taxRate:
						income.type === "PJ"
							? income.taxRate || DEFAULT_PJ_TAX_RATE
							: DEFAULT_PJ_TAX_RATE,
					date: income.date,
					description: income.description,
				}}
			/>
		</div>
	);
}
