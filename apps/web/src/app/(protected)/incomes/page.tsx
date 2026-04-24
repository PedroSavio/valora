import { auth } from "@valora/auth";
import type { Route } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { IncomeFilters } from "@/features/incomes/components/income-filters";
import { IncomeList } from "@/features/incomes/components/income-list";
import { listIncomes } from "@/features/incomes/data/incomes.repo";
import { incomeFiltersSchema } from "@/features/incomes/schemas";

type SearchParams = {
	month?: string | string[];
	year?: string | string[];
	type?: string | string[];
	fromDate?: string | string[];
	toDate?: string | string[];
};

function pick(value?: string | string[]) {
	return Array.isArray(value) ? value[0] : value;
}

export default async function IncomesPage({
	searchParams,
}: {
	searchParams?: Promise<SearchParams>;
}) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) redirect("/login");

	const raw = await searchParams;
	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
		.toISOString()
		.slice(0, 10);
	const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
		.toISOString()
		.slice(0, 10);
	const parsed = incomeFiltersSchema.safeParse({
		month: pick(raw?.month),
		year: pick(raw?.year),
		type: pick(raw?.type),
		fromDate: pick(raw?.fromDate),
		toDate: pick(raw?.toDate),
	});

	const filters = parsed.success ? parsed.data : {};
	const fromDate = filters.fromDate ?? monthStart;
	const toDate = filters.toDate ?? monthEnd;

	const incomes = await listIncomes(session.user.id, {
		fromDate,
		toDate,
		type: filters.type,
	});

	return (
		<div className="mx-auto w-full max-w-[1100px] space-y-6 p-6 lg:p-10">
			<header className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-semibold text-2xl tracking-tight">Entradas</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Registros de recebimentos CLT e PJ por período.
					</p>
				</div>
				<Link
					href={"/incomes/new" as Route}
					className="rounded-[14px] bg-primary px-4 py-2 font-semibold text-primary-foreground text-sm hover:bg-primary/90"
				>
					Nova entrada
				</Link>
			</header>

			<div className="rounded-[18px] border border-border bg-card p-4">
				<IncomeFilters
					fromDate={fromDate}
					toDate={toDate}
					selectedType={filters.type}
				/>
			</div>

			<IncomeList incomes={incomes} />
		</div>
	);
}
