import type { Route } from "next";
import Link from "next/link";

import { IncomeFilters } from "@/features/incomes/components/income-filters";
import { IncomeList } from "@/features/incomes/components/income-list";
import { listIncomes } from "@/features/incomes/data/incomes.repo";
import { incomeFiltersSchema } from "@/features/incomes/schemas";
import { endOfMonth, startOfMonth, toISODate } from "@/lib/date";
import { pickParam } from "@/lib/search-params";
import { requireSession } from "@/lib/session";

type SearchParams = {
	month?: string | string[];
	year?: string | string[];
	type?: string | string[];
	fromDate?: string | string[];
	toDate?: string | string[];
};

export default async function IncomesPage({
	searchParams,
}: {
	searchParams?: Promise<SearchParams>;
}) {
	const session = await requireSession();
	const raw = await searchParams;

	const now = new Date();
	const monthStart = toISODate(startOfMonth(now));
	const monthEnd = toISODate(endOfMonth(now));

	const parsed = incomeFiltersSchema.safeParse({
		month: pickParam(raw?.month),
		year: pickParam(raw?.year),
		type: pickParam(raw?.type),
		fromDate: pickParam(raw?.fromDate),
		toDate: pickParam(raw?.toDate),
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
		<div className="mx-auto w-full max-w-[1100px] space-y-6 p-4 sm:p-6 lg:p-10">
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
