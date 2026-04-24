"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { EXPENSE_CATEGORIES } from "@/lib/categories";
import { formatBRL } from "@/lib/format";

import { confirmBill } from "../actions/confirm-bill";
import type { BillItemReview } from "../schemas";

type Props = {
	billId: string;
	initialItems: BillItemReview[];
	defaultDueDate: string;
	relatedPeople: { id: string; name: string }[];
};

export function BillReviewTable({
	billId,
	initialItems,
	defaultDueDate,
	relatedPeople,
}: Props) {
	const [items, setItems] = useState<BillItemReview[]>(
		initialItems.map((item) => ({
			...item,
			dueDate: item.dueDate || defaultDueDate,
		})),
	);
	const [applyDirection, setApplyDirection] =
		useState<BillItemReview["direction"]>("PAYABLE");
	const [applyPersonId, setApplyPersonId] = useState("");
	const [applyPersonName, setApplyPersonName] = useState("");
	const [isPending, startTransition] = useTransition();

	function updateItem<K extends keyof BillItemReview>(
		id: string,
		key: K,
		value: BillItemReview[K],
	) {
		setItems((curr) =>
			curr.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
		);
	}

	function applyToAll() {
		setItems((curr) =>
			curr.map((item) => ({
				...item,
				direction: applyDirection,
				personId: applyDirection === "RECEIVABLE" ? applyPersonId : "",
				personName: applyDirection === "RECEIVABLE" ? applyPersonName : "",
			})),
		);
	}

	function submit() {
		startTransition(async () => {
			try {
				await confirmBill({ billId, items });
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "Falha ao confirmar");
			}
		});
	}

	const selectedItems = items.filter((item) => item.selected);
	const selectedCount = selectedItems.length;
	const selectedTotal = selectedItems.reduce(
		(sum, item) => sum + Number(item.amount),
		0,
	);

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 gap-3 rounded-[18px] border border-border bg-card p-4 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end">
				<p className="text-muted-foreground text-sm sm:col-span-2 lg:w-full">
					Aplicar para todos os itens:
				</p>
				<label className="flex flex-col gap-1 text-muted-foreground text-xs">
					Responsável
					<select
						value={applyDirection}
						onChange={(e) =>
							setApplyDirection(e.target.value as BillItemReview["direction"])
						}
						className="h-10 rounded-md border border-border bg-background px-3 text-foreground text-sm outline-none ring-primary/20 focus:ring-2"
					>
						<option value="PAYABLE">Minha</option>
						<option value="RECEIVABLE">Outra pessoa</option>
					</select>
				</label>
				{applyDirection === "RECEIVABLE" ? (
					<>
						<label className="flex flex-col gap-1 text-muted-foreground text-xs">
							Pessoa existente
							<select
								value={applyPersonId}
								onChange={(e) => setApplyPersonId(e.target.value)}
								className="h-10 w-full rounded-md border border-border bg-background px-3 text-foreground text-sm outline-none ring-primary/20 focus:ring-2 lg:min-w-44"
							>
								<option value="">Selecionar</option>
								{relatedPeople.map((p) => (
									<option key={p.id} value={p.id}>
										{p.name}
									</option>
								))}
							</select>
						</label>
						<label className="flex flex-col gap-1 text-muted-foreground text-xs">
							Ou nome
							<input
								value={applyPersonName}
								onChange={(e) => setApplyPersonName(e.target.value)}
								placeholder="Nome da pessoa"
								className="h-10 w-full rounded-md border border-border bg-background px-3 text-foreground text-sm outline-none ring-primary/20 focus:ring-2 lg:min-w-48"
							/>
						</label>
					</>
				) : null}
				<button
					type="button"
					onClick={applyToAll}
					className="h-10 rounded-md border border-border px-4 font-medium text-sm hover:bg-card/70 sm:col-span-2 lg:col-span-1"
				>
					Aplicar para todos
				</button>
			</div>
			<div className="overflow-x-auto rounded-[18px] border border-border bg-card">
				<table className="w-full min-w-[820px] text-sm">
					<thead className="border-border border-b bg-black/20 text-muted-foreground text-xs uppercase tracking-wide">
						<tr>
							<th className="px-3 py-3 text-left">Dívida</th>
							<th className="px-3 py-3 text-left">Descrição</th>
							<th className="px-3 py-3 text-right">Valor</th>
							<th className="px-3 py-3 text-left">Categoria</th>
							<th className="px-3 py-3 text-left">Tipo</th>
							<th className="px-3 py-3 text-left">Recorrência</th>
							<th className="px-3 py-3 text-left">Responsável</th>
							<th className="px-3 py-3 text-left">Pessoa</th>
							<th className="px-3 py-3 text-left">Vencimento</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{items.map((item) => (
							<tr key={item.id}>
								<td className="px-3 py-3">
									<input
										type="checkbox"
										checked={item.selected}
										onChange={(e) =>
											updateItem(item.id, "selected", e.target.checked)
										}
										className="size-4 accent-primary"
									/>
								</td>
								<td className="px-3 py-2">
									<input
										value={item.description}
										onChange={(e) =>
											updateItem(item.id, "description", e.target.value)
										}
										className="w-full rounded-md bg-transparent px-2 py-1 text-sm outline-none hover:bg-black/20 focus:bg-black/30"
									/>
								</td>
								<td className="px-3 py-2 text-right">
									<input
										type="number"
										step="0.01"
										value={item.amount}
										onChange={(e) =>
											updateItem(item.id, "amount", Number(e.target.value))
										}
										className="w-28 rounded-md bg-transparent px-2 py-1 text-right text-sm outline-none hover:bg-black/20 focus:bg-black/30"
									/>
								</td>
								<td className="px-3 py-2">
									<select
										value={
											EXPENSE_CATEGORIES.includes(
												item.category as (typeof EXPENSE_CATEGORIES)[number],
											)
												? item.category
												: "Outros"
										}
										onChange={(e) =>
											updateItem(item.id, "category", e.target.value)
										}
										className="rounded-md bg-transparent px-2 py-1 text-sm outline-none hover:bg-black/20"
									>
										{EXPENSE_CATEGORIES.map((c) => (
											<option key={c} value={c} className="bg-card">
												{c}
											</option>
										))}
									</select>
								</td>
								<td className="px-3 py-2">
									<select
										value={item.type}
										onChange={(e) =>
											updateItem(
												item.id,
												"type",
												e.target.value as BillItemReview["type"],
											)
										}
										className="rounded-md bg-transparent px-2 py-1 text-sm outline-none hover:bg-black/20"
									>
										<option value="VARIABLE" className="bg-card">
											Variável
										</option>
										<option value="FIXED" className="bg-card">
											Fixa
										</option>
									</select>
								</td>
								<td className="px-3 py-2">
									<select
										value={item.recurrence}
										onChange={(e) =>
											updateItem(
												item.id,
												"recurrence",
												e.target.value as BillItemReview["recurrence"],
											)
										}
										className="rounded-md bg-transparent px-2 py-1 text-sm outline-none hover:bg-black/20"
									>
										<option value="NONE" className="bg-card">
											Pontual
										</option>
										<option value="MONTHLY" className="bg-card">
											Mensal
										</option>
										<option value="WEEKLY" className="bg-card">
											Semanal
										</option>
										<option value="YEARLY" className="bg-card">
											Anual
										</option>
									</select>
								</td>
								<td className="px-3 py-2">
									<select
										value={item.direction}
										onChange={(e) =>
											updateItem(
												item.id,
												"direction",
												e.target.value as BillItemReview["direction"],
											)
										}
										className="rounded-md bg-transparent px-2 py-1 text-sm outline-none hover:bg-black/20"
									>
										<option value="PAYABLE" className="bg-card">
											Minha
										</option>
										<option value="RECEIVABLE" className="bg-card">
											Outra pessoa
										</option>
									</select>
								</td>
								<td className="px-3 py-2">
									{item.direction === "RECEIVABLE" ? (
										<div className="flex min-w-56 flex-col gap-1">
											<select
												value={item.personId ?? ""}
												onChange={(e) =>
													updateItem(item.id, "personId", e.target.value)
												}
												className="rounded-md bg-transparent px-2 py-1 text-sm outline-none hover:bg-black/20"
											>
												<option value="" className="bg-card">
													Pessoa existente
												</option>
												{relatedPeople.map((p) => (
													<option key={p.id} value={p.id} className="bg-card">
														{p.name}
													</option>
												))}
											</select>
											<input
												value={item.personName ?? ""}
												onChange={(e) =>
													updateItem(item.id, "personName", e.target.value)
												}
												placeholder="Ou digite o nome"
												className="rounded-md bg-transparent px-2 py-1 text-sm outline-none hover:bg-black/20 focus:bg-black/30"
											/>
										</div>
									) : (
										<span className="text-muted-foreground text-xs">-</span>
									)}
								</td>
								<td className="px-3 py-2">
									<input
										type="date"
										value={item.dueDate.slice(0, 10)}
										onChange={(e) =>
											updateItem(item.id, "dueDate", e.target.value)
										}
										className="rounded-md bg-transparent px-2 py-1 text-sm outline-none hover:bg-black/20"
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-border bg-card p-4">
				<p className="text-muted-foreground text-sm">
					{selectedCount} item(s) selecionado(s) ·{" "}
					<span className="font-semibold text-foreground">
						{formatBRL(selectedTotal)}
					</span>
				</p>
				<button
					type="button"
					disabled={isPending || selectedCount === 0}
					onClick={submit}
					className="rounded-[18px] bg-primary px-6 py-3 font-semibold text-primary-foreground text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
				>
					{isPending ? "Confirmando..." : "Confirmar e criar dívidas"}
				</button>
			</div>
		</div>
	);
}
