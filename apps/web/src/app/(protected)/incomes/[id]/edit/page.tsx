import { auth } from "@valora/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { IncomeForm } from "@/features/incomes/components/income-form";
import { getIncomeById } from "@/features/incomes/data/incomes.repo";

export default async function EditIncomePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) redirect("/login");

	const income = await getIncomeById(session.user.id, id);
	if (!income) notFound();

	return (
		<div className="mx-auto w-full max-w-2xl space-y-6 p-6 lg:p-10">
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
					taxRate: income.type === "PJ" ? income.taxRate || 6 : 6,
					date: income.date,
					description: income.description,
				}}
			/>
		</div>
	);
}
