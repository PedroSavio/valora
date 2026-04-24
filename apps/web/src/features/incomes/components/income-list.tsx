import { Briefcase, Building2, Trash2 } from "lucide-react";
import Link from "next/link";

import { formatBRL, formatShortDate } from "@/lib/format";

import { deleteIncome } from "../actions/delete-income";

type IncomeType = "CLT" | "PJ";

type Income = {
	id: string;
	type: IncomeType;
	amount: number;
	date: string;
	description: string | null;
};

const TYPE_LABELS: Record<IncomeType, string> = {
	CLT: "Salário CLT",
	PJ: "Recebimento PJ",
};

function TypeBadge({ type }: { type: IncomeType }) {
	const isClt = type === "CLT";
	const className = `flex size-10 items-center justify-center rounded-full ${
		isClt ? "bg-primary/15 text-primary" : "bg-blue-500/15 text-blue-400"
	}`;
	return (
		<span className={className}>
			{isClt ? (
				<Briefcase className="size-4" />
			) : (
				<Building2 className="size-4" />
			)}
		</span>
	);
}

export function IncomeList({ incomes }: { incomes: Income[] }) {
	if (incomes.length === 0) {
		return (
			<div className="rounded-[18px] border border-border border-dashed bg-card p-10 text-center text-muted-foreground text-sm">
				Nenhuma entrada registrada no período selecionado.
			</div>
		);
	}

	const total = incomes.reduce((sum, i) => sum + i.amount, 0);

	return (
		<div className="space-y-3">
			<ul className="grid grid-cols-1 gap-3">
				{incomes.map((income) => (
					<li
						key={income.id}
						className="flex flex-col gap-3 rounded-[18px] border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
					>
						<div className="flex min-w-0 items-center gap-3">
							<TypeBadge type={income.type} />
							<div className="min-w-0">
								<p className="truncate font-medium text-foreground">
									{TYPE_LABELS[income.type]}
									{income.description ? ` · ${income.description}` : ""}
								</p>
								<p className="text-muted-foreground text-xs">
									{formatShortDate(income.date)}
								</p>
							</div>
						</div>
						<div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end sm:gap-3">
							<span className="font-semibold text-primary text-sm">
								{formatBRL(income.amount)}
							</span>
							<div className="flex flex-wrap items-center gap-2">
								<Link
									href={`/incomes/${income.id}/edit`}
									className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 font-medium text-xs hover:bg-card/70"
								>
									Editar
								</Link>
								<form action={deleteIncome.bind(null, income.id)}>
									<button
										type="submit"
										className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 font-medium text-destructive text-xs hover:bg-destructive/10"
									>
										<Trash2 className="size-3.5" />
										Excluir
									</button>
								</form>
							</div>
						</div>
					</li>
				))}
			</ul>
			<div className="flex items-center justify-between rounded-[18px] border border-border bg-card px-4 py-3 text-sm">
				<span className="text-muted-foreground">
					{incomes.length} entrada(s)
				</span>
				<span className="font-semibold text-foreground">
					Total: {formatBRL(total)}
				</span>
			</div>
		</div>
	);
}
