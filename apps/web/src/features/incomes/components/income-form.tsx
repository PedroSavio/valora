"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { useTransition } from "react";
import { toast } from "sonner";

import { FormField, formInputClass } from "@/components/form-field";
import { toISODate } from "@/lib/date";
import { formatBRL } from "@/lib/format";

import { createIncome } from "../actions/create-income";
import { updateIncome } from "../actions/update-income";
import { createIncomeSchema } from "../schemas";

type IncomeFormValues = {
	type: "CLT" | "PJ";
	amount: number;
	taxRate: number;
	date: string;
	description: string;
};

type IncomeFormProps = {
	mode?: "create" | "edit";
	incomeId?: string;
	initialValues?: IncomeFormValues;
};

const DEFAULT_PJ_TAX_RATE = 6;

const DEFAULT_VALUES: IncomeFormValues = {
	type: "CLT",
	amount: 0,
	taxRate: DEFAULT_PJ_TAX_RATE,
	date: toISODate(new Date()),
	description: "",
};

const nextMonthFormatter = new Intl.DateTimeFormat("pt-BR", {
	month: "long",
	year: "numeric",
});

const moneyInputFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

function nextMonthLabel(dateStr: string): string {
	const parsed = new Date(`${dateStr}T12:00:00`);
	if (Number.isNaN(parsed.getTime())) return "próximo mês";
	const next = new Date(parsed.getFullYear(), parsed.getMonth() + 1, 1);
	return nextMonthFormatter.format(next);
}

function formatMoneyInput(value: number): string {
	if (!value) return "";
	return moneyInputFormatter.format(value);
}

function parseMoneyInput(raw: string): number {
	const digits = raw.replace(/\D/g, "");
	if (!digits) return 0;
	return Number(digits) / 100;
}

function calculateEstimatedTax(amount: number, taxRate: number): number {
	return Math.max(0, ((Number(amount) || 0) * (Number(taxRate) || 0)) / 100);
}

export function IncomeForm({
	mode = "create",
	incomeId,
	initialValues,
}: IncomeFormProps) {
	const [isPending, startTransition] = useTransition();

	const form = useForm({
		defaultValues: initialValues ?? DEFAULT_VALUES,
		validators: { onSubmit: createIncomeSchema },
		onSubmit: ({ value }) =>
			startTransition(async () => {
				try {
					if (mode === "edit") {
						if (!incomeId) throw new Error("income_id_required");
						await updateIncome({ id: incomeId, ...value });
					} else {
						await createIncome(value);
					}
				} catch (err) {
					toast.error(err instanceof Error ? err.message : "Falha ao salvar");
				}
			}),
	});

	const type = useStore(form.store, (s) => s.values.type);
	const amountValue = useStore(form.store, (s) => s.values.amount);
	const taxRateValue = useStore(form.store, (s) => s.values.taxRate);
	const dateValue = useStore(form.store, (s) => s.values.date);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="grid grid-cols-1 gap-4 sm:grid-cols-2"
		>
			<form.Field name="type">
				{(field) => (
					<FormField label="Tipo">
						<select
							className={formInputClass}
							value={field.state.value}
							onChange={(e) =>
								field.handleChange(e.target.value as "CLT" | "PJ")
							}
						>
							<option value="CLT" className="bg-card">
								CLT
							</option>
							<option value="PJ" className="bg-card">
								PJ
							</option>
						</select>
					</FormField>
				)}
			</form.Field>

			<form.Field name="amount">
				{(field) => (
					<FormField label="Valor" error={field.state.meta.errors[0]?.message}>
						<input
							type="text"
							inputMode="numeric"
							className={formInputClass}
							value={formatMoneyInput(field.state.value)}
							onChange={(e) =>
								field.handleChange(parseMoneyInput(e.target.value))
							}
							placeholder="R$ 0,00"
						/>
					</FormField>
				)}
			</form.Field>

			{type === "PJ" && (
				<>
					<form.Field name="taxRate">
						{(field) => (
							<FormField
								label="Imposto (%)"
								error={field.state.meta.errors[0]?.message}
							>
								<input
									type="number"
									step="0.01"
									min="0"
									max="100"
									inputMode="decimal"
									className={formInputClass}
									value={field.state.value || ""}
									onChange={(e) => {
										const v = e.target.value;
										field.handleChange(v === "" ? 0 : Number(v));
									}}
								/>
							</FormField>
						)}
					</form.Field>

					<div className="rounded-[14px] border border-yellow-600 bg-yellow-50/50 p-4 sm:col-span-2">
						<p className="text-sm text-yellow-900">
							Imposto estimado:{" "}
							<strong>
								{formatBRL(calculateEstimatedTax(amountValue, taxRateValue))}
							</strong>{" "}
							a pagar em <strong>{nextMonthLabel(dateValue)}</strong>.
						</p>
					</div>
				</>
			)}

			<form.Field name="date">
				{(field) => (
					<FormField label="Data" error={field.state.meta.errors[0]?.message}>
						<input
							type="date"
							className={formInputClass}
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
					</FormField>
				)}
			</form.Field>

			<form.Field name="description">
				{(field) => (
					<FormField label="Descrição" className="sm:col-span-2">
						<textarea
							className={`${formInputClass} min-h-[80px]`}
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Ex.: Salário Empresa X · NF #123"
						/>
					</FormField>
				)}
			</form.Field>

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
							: "Registrar entrada"}
				</button>
			</div>
		</form>
	);
}
