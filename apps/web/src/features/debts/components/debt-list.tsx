import { Calendar, Receipt, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";

import { deleteDebt } from "@/features/debts/actions/delete-debt";
import { settleDebt } from "@/features/debts/actions/settle-debt";
import { formatBRL, formatShortDate } from "@/lib/format";

type DebtDirection = "PAYABLE" | "RECEIVABLE";

type Debt = {
	id: string;
	title: string;
	amount: number;
	category: string;
	status: string;
	source: string;
	childCount: number;
	direction: DebtDirection;
	personName: string | null;
	dueDate: string;
};

const STATUS_LABELS: Record<string, string> = {
	OPEN: "Em aberto",
	PAID: "Pago",
	OVERDUE: "Vencida",
	CANCELED: "Cancelada",
};

function directionLabel(direction: DebtDirection) {
	return direction === "RECEIVABLE" ? "Te devem" : "Você deve";
}

function statusLabel(status: string) {
	return STATUS_LABELS[status] ?? status;
}

export function DebtList({ debts }: { debts: Debt[] }) {
	if (debts.length === 0) {
		return (
			<div className="rounded-[18px] border border-border border-dashed bg-card p-10 text-center text-muted-foreground text-sm">
				Nenhuma dívida cadastrada ainda.
			</div>
		);
	}

	return (
		<ul className="grid grid-cols-1 gap-3">
			{debts.map((debt) => (
				<li
					key={debt.id}
					className="flex flex-col gap-3 rounded-[18px] border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
				>
					<div className="flex min-w-0 items-center gap-3">
						<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black/30 text-muted-foreground">
							{debt.source === "BILL" ? (
								<Sparkles className="size-4" />
							) : (
								<Receipt className="size-4" />
							)}
						</span>
						<div className="min-w-0">
							<p className="truncate font-medium text-foreground">
								{debt.title}
							</p>
							<p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs">
								<Calendar className="size-3" />
								{formatShortDate(debt.dueDate)} ·{" "}
								{directionLabel(debt.direction)}
								{debt.personName ? ` · ${debt.personName}` : ""} ·{" "}
								{debt.category} · {statusLabel(debt.status)}
								{debt.childCount > 0 ? ` · ${debt.childCount} itens` : ""}
								{debt.source === "BILL" && debt.childCount > 0
									? " · Fatura"
									: ""}
							</p>
						</div>
					</div>
					<div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end sm:gap-3">
						<span className="font-semibold text-sm">
							{formatBRL(debt.amount)}
						</span>
						<div className="flex flex-wrap items-center gap-2">
							<form action={settleDebt.bind(null, debt.id)}>
								<button
									type="submit"
									className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 font-medium text-xs hover:bg-card/70"
								>
									{debt.status === "PAID" ? "Reabrir" : "Dar baixa"}
								</button>
							</form>
							<Link
								href={`/debts/${debt.id}/edit`}
								className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 font-medium text-xs hover:bg-card/70"
							>
								Editar
							</Link>
							<form action={deleteDebt.bind(null, debt.id)}>
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
	);
}
