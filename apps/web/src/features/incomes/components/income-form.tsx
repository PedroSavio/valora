"use client";

import { useForm } from "@tanstack/react-form";
import { useTransition } from "react";
import { toast } from "sonner";

import { createIncome } from "../actions/create-income";
import { updateIncome } from "../actions/update-income";
import { createIncomeSchema } from "../schemas";

type IncomeFormValues = {
  type: "CLT" | "PJ";
  amount: number;
  date: string;
  description: string;
};

type IncomeFormProps = {
  mode?: "create" | "edit";
  incomeId?: string;
  initialValues?: IncomeFormValues;
};

export function IncomeForm({ mode = "create", incomeId, initialValues }: IncomeFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    defaultValues:
      initialValues ??
      ({
        type: "CLT",
        amount: 0,
        date: new Date().toISOString().slice(0, 10),
        description: "",
      } satisfies IncomeFormValues),
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

  const inputCls =
    "w-full rounded-[14px] border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary/60";

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
          <Field label="Tipo">
            <select
              className={inputCls}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value as "CLT" | "PJ")}
            >
              <option value="CLT" className="bg-card">CLT</option>
              <option value="PJ" className="bg-card">PJ</option>
            </select>
          </Field>
        )}
      </form.Field>

      <form.Field name="amount">
        {(field) => (
          <Field label="Valor (R$)" error={field.state.meta.errors[0]?.message}>
            <input
              type="number"
              step="0.01"
              className={inputCls}
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
            />
          </Field>
        )}
      </form.Field>

      <form.Field name="date">
        {(field) => (
          <Field label="Data" error={field.state.meta.errors[0]?.message}>
            <input
              type="date"
              className={inputCls}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </Field>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <Field label="Descrição" className="sm:col-span-2">
            <textarea
              className={`${inputCls} min-h-[80px]`}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Ex.: Salário Empresa X · NF #123"
            />
          </Field>
        )}
      </form.Field>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-[18px] bg-primary py-4 text-sm font-semibold text-primary-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Salvando..." : mode === "edit" ? "Salvar alterações" : "Registrar entrada"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
  );
}
