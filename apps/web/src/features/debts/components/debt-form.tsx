"use client";

import { useForm } from "@tanstack/react-form";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { FormField, formInputClass } from "@/components/form-field";
import { EXPENSE_CATEGORIES } from "@/lib/categories";
import { toISODate } from "@/lib/date";

import { createDebt } from "../actions/create-debt";
import { updateDebt } from "../actions/update-debt";
import { createDebtSchema } from "../schemas";

type RelatedPersonOption = {
	id: string;
	name: string;
};

type DebtChild = { id?: string; title: string; amount: number };

type DebtFormValues = {
	title: string;
	amount: number;
	category: string;
	type: "FIXED" | "VARIABLE";
	recurrence: "NONE" | "MONTHLY" | "WEEKLY" | "YEARLY";
	direction: "PAYABLE" | "RECEIVABLE";
	personId: string;
	personName: string;
	children?: DebtChild[];
	dueDate: string;
	notes: string;
};

type DebtFormProps = {
	relatedPeople: RelatedPersonOption[];
	mode?: "create" | "edit";
	debtId?: string;
	initialValues?: DebtFormValues;
};

const DEFAULT_VALUES: DebtFormValues = {
	title: "",
	amount: 0,
	category: "Outros",
	type: "VARIABLE",
	recurrence: "NONE",
	direction: "PAYABLE",
	personId: "",
	personName: "",
	children: [],
	dueDate: toISODate(new Date()),
	notes: "",
};

function sumChildren(children: DebtChild[]): number {
	return children.reduce(
		(sum, child) => sum + (Number.isFinite(child.amount) ? child.amount : 0),
		0,
	);
}

export function DebtForm({
	relatedPeople,
	mode = "create",
	debtId,
	initialValues,
}: DebtFormProps) {
	const [isPending, startTransition] = useTransition();
	const [hasChildren, setHasChildren] = useState<boolean>(
		(initialValues?.children?.length ?? 0) > 0,
	);
	const [children, setChildren] = useState<DebtChild[]>(
		initialValues?.children ?? [],
	);

	const childrenTotal = useMemo(() => sumChildren(children), [children]);

	const form = useForm({
		defaultValues: initialValues ?? DEFAULT_VALUES,
		validators: { onSubmit: createDebtSchema },
		onSubmit: ({ value }) =>
			startTransition(async () => {
				try {
					const payload = {
						...value,
						amount: hasChildren ? childrenTotal : value.amount,
						children: hasChildren ? children : [],
					};
					if (mode === "edit") {
						if (!debtId) throw new Error("debt_id_required");
						await updateDebt({ id: debtId, ...payload });
					} else {
						await createDebt(payload);
					}
				} catch (err) {
					toast.error(err instanceof Error ? err.message : "Falha ao salvar");
				}
			}),
	});

	const isReceivable = form.state.values.direction === "RECEIVABLE";

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="grid grid-cols-1 gap-4 sm:grid-cols-2"
		>
			<form.Field name="title">
				{(field) => (
					<FormField
						label="Título"
						error={field.state.meta.errors[0]?.message}
						className="sm:col-span-2"
					>
						<input
							className={formInputClass}
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							onBlur={field.handleBlur}
						/>
					</FormField>
				)}
			</form.Field>

			<form.Field name="direction">
				{(field) => (
					<FormField label="Tipo de registro">
						<select
							className={formInputClass}
							value={field.state.value}
							onChange={(e) =>
								field.handleChange(e.target.value as "PAYABLE" | "RECEIVABLE")
							}
						>
							<option value="PAYABLE" className="bg-card">
								Eu devo
							</option>
							<option value="RECEIVABLE" className="bg-card">
								A pessoa me deve
							</option>
						</select>
					</FormField>
				)}
			</form.Field>

			<form.Field name="amount">
				{(field) => (
					<FormField
						label="Valor (R$)"
						error={field.state.meta.errors[0]?.message}
					>
						<input
							type="number"
							step="0.01"
							className={formInputClass}
							value={hasChildren ? childrenTotal : field.state.value}
							onChange={(e) => field.handleChange(Number(e.target.value))}
							readOnly={hasChildren}
						/>
					</FormField>
				)}
			</form.Field>

			<form.Field name="dueDate">
				{(field) => (
					<FormField
						label="Vencimento"
						error={field.state.meta.errors[0]?.message}
					>
						<input
							type="date"
							className={formInputClass}
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
					</FormField>
				)}
			</form.Field>

			{isReceivable ? (
				<>
					<form.Field name="personId">
						{(field) => (
							<FormField label="Pessoa relacionada">
								<select
									className={formInputClass}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								>
									<option value="" className="bg-card">
										Selecionar pessoa existente
									</option>
									{relatedPeople.map((p) => (
										<option key={p.id} value={p.id} className="bg-card">
											{p.name}
										</option>
									))}
								</select>
							</FormField>
						)}
					</form.Field>

					<form.Field name="personName">
						{(field) => (
							<FormField
								label="Ou nova pessoa"
								error={field.state.meta.errors[0]?.message}
							>
								<input
									className={formInputClass}
									placeholder="Nome da pessoa"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
								/>
							</FormField>
						)}
					</form.Field>
				</>
			) : null}

			<form.Field name="category">
				{(field) => (
					<FormField label="Categoria">
						<select
							className={formInputClass}
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
						>
							{EXPENSE_CATEGORIES.map((c) => (
								<option key={c} value={c} className="bg-card">
									{c}
								</option>
							))}
						</select>
					</FormField>
				)}
			</form.Field>

			<form.Field name="type">
				{(field) => (
					<FormField label="Tipo">
						<select
							className={formInputClass}
							value={field.state.value}
							onChange={(e) =>
								field.handleChange(e.target.value as "FIXED" | "VARIABLE")
							}
						>
							<option value="VARIABLE" className="bg-card">
								Variável
							</option>
							<option value="FIXED" className="bg-card">
								Fixa
							</option>
						</select>
					</FormField>
				)}
			</form.Field>

			<form.Field name="recurrence">
				{(field) => (
					<FormField label="Recorrência">
						<select
							className={formInputClass}
							value={field.state.value}
							onChange={(e) =>
								field.handleChange(
									e.target.value as "NONE" | "MONTHLY" | "WEEKLY" | "YEARLY",
								)
							}
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
					</FormField>
				)}
			</form.Field>

			<form.Field name="notes">
				{(field) => (
					<FormField label="Notas" className="sm:col-span-2">
						<textarea
							className={`${formInputClass} min-h-[80px]`}
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
					</FormField>
				)}
			</form.Field>

			<div className="rounded-[14px] border border-border bg-card p-4 sm:col-span-2">
				<div className="mb-3 flex items-center justify-between gap-3">
					<p className="font-medium text-sm">Itens da dívida (filhas)</p>
					<label className="inline-flex items-center gap-2 text-muted-foreground text-xs">
						<input
							type="checkbox"
							checked={hasChildren}
							onChange={(e) => {
								const checked = e.target.checked;
								setHasChildren(checked);
								if (checked && children.length === 0) {
									setChildren([{ title: "", amount: 0 }]);
								}
								if (!checked) {
									setChildren([]);
								}
							}}
							className="size-4 accent-primary"
						/>
						Esta dívida possui itens
					</label>
				</div>
				{hasChildren ? (
					<div className="space-y-3">
						{children.map((child, index) => (
							<div
								key={child.id ?? `new-${index}`}
								className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px_auto]"
							>
								<input
									className={formInputClass}
									placeholder="Descrição do item"
									value={child.title}
									onChange={(e) =>
										setChildren((curr) =>
											curr.map((c, i) =>
												i === index ? { ...c, title: e.target.value } : c,
											),
										)
									}
								/>
								<input
									type="number"
									step="0.01"
									className={formInputClass}
									placeholder="Valor"
									value={child.amount}
									onChange={(e) =>
										setChildren((curr) =>
											curr.map((c, i) =>
												i === index
													? { ...c, amount: Number(e.target.value) }
													: c,
											),
										)
									}
								/>
								<button
									type="button"
									onClick={() =>
										setChildren((curr) => curr.filter((_, i) => i !== index))
									}
									className="rounded-md border border-border px-3 py-2 font-medium text-destructive text-xs hover:bg-destructive/10"
								>
									Remover
								</button>
							</div>
						))}

						<div className="flex flex-wrap items-center justify-between gap-3">
							<button
								type="button"
								onClick={() =>
									setChildren((curr) => [...curr, { title: "", amount: 0 }])
								}
								className="rounded-md border border-border px-3 py-2 font-medium text-xs hover:bg-card/70"
							>
								Adicionar item
							</button>
							<p className="text-muted-foreground text-sm">
								Total dos itens:{" "}
								<span className="font-semibold text-foreground">
									{childrenTotal.toFixed(2)}
								</span>
							</p>
						</div>
					</div>
				) : (
					<p className="text-muted-foreground text-xs">
						Quando ativado, o valor da dívida pai será calculado automaticamente
						pela soma dos itens.
					</p>
				)}
			</div>

			<div className="sm:col-span-2">
				<button
					type="submit"
					disabled={isPending}
					className="w-full rounded-[18px] bg-primary py-4 font-semibold text-primary-foreground text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
				>
					{isPending
						? "Salvando..."
						: mode === "edit"
							? "Salvar alterações"
							: "Salvar registro"}
				</button>
			</div>
		</form>
	);
}
