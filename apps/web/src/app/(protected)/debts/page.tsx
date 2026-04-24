import Link from "next/link";

import { DebtFilters } from "@/features/debts/components/debt-filters";
import { DebtList } from "@/features/debts/components/debt-list";
import { listDebts } from "@/features/debts/data/debts.repo";
import { debtFiltersSchema } from "@/features/debts/schemas";
import { endOfMonth, startOfMonth, toISODate } from "@/lib/date";
import { pickParam } from "@/lib/search-params";
import { requireSession } from "@/lib/session";

type SearchParams = {
	fromDate?: string | string[];
	toDate?: string | string[];
};

export default async function DebtsPage({
	searchParams,
}: {
	searchParams?: Promise<SearchParams>;
}) {
	const session = await requireSession();
	const raw = await searchParams;

	const now = new Date();
	const monthStart = toISODate(startOfMonth(now));
	const monthEnd = toISODate(endOfMonth(now));

	const parsed = debtFiltersSchema.safeParse({
		fromDate: pickParam(raw?.fromDate),
		toDate: pickParam(raw?.toDate),
	});
	const filters = parsed.success ? parsed.data : {};
	const fromDate = filters.fromDate ?? monthStart;
	const toDate = filters.toDate ?? monthEnd;

	const debts = await listDebts(session.user.id, { fromDate, toDate });
	const payables = debts.filter((d) => d.direction === "PAYABLE").length;
	const receivables = debts.filter((d) => d.direction === "RECEIVABLE").length;

	return (
		<div className="mx-auto w-full max-w-[1100px] space-y-6 p-6 lg:p-10">
			<header className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="font-semibold text-2xl tracking-tight">Dívidas</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						{debts.length} item(s): {payables} que você deve e {receivables} que
						te devem.
					</p>
				</div>
				<div className="flex gap-2">
					<Link
						href="/bills/new"
						className="rounded-[14px] border border-border bg-card px-4 py-2 font-medium text-sm hover:bg-card/70"
					>
						Importar fatura
					</Link>
					<Link
						href="/debts/new"
						className="rounded-[14px] bg-primary px-4 py-2 font-semibold text-primary-foreground text-sm hover:bg-primary/90"
					>
						Nova dívida
					</Link>
				</div>
			</header>
			<div className="rounded-[18px] border border-border bg-card p-4">
				<DebtFilters fromDate={fromDate} toDate={toDate} />
			</div>
			<DebtList debts={debts} />
		</div>
	);
}
