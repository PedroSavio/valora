"use client";

import { useForm } from "@tanstack/react-form";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { createDebt } from "../actions/create-debt";
import { updateDebt } from "../actions/update-debt";
import { createDebtSchema } from "../schemas";

const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Serviços",
  "Moradia",
  "Saúde",
  "Lazer",
  "Educação",
  "Cartão",
  "Outros",
];

type RelatedPersonOption = {
  id: string;
  name: string;
};

type DebtFormValues = {
  title: string;
  amount: number;
  category: string;
  type: "FIXED" | "VARIABLE";
  recurrence: "NONE" | "MONTHLY" | "WEEKLY" | "YEARLY";
  direction: "PAYABLE" | "RECEIVABLE";
  personId: string;
  personName: string;
  children?: { id?: string; title: string; amount: number }[];
  dueDate: string;
  notes: string;
};

type DebtFormProps = {
  relatedPeople: RelatedPersonOption[];
  mode?: "create" | "edit";
  debtId?: string;
  initialValues?: DebtFormValues;
};

export function DebtForm({ relatedPeople, mode = "create", debtId, initialValues }: DebtFormProps) {
  const [isPending, startTransition] = useTransition();
  const [hasChildren, setHasChildren] = useState<boolean>((initialValues?.children?.length ?? 0) > 0);
  const [children, setChildren] = useState<{ id?: string; title: string; amount: number }[]>(
    initialValues?.children ?? [],
  );

  const childrenTotal = useMemo(
    () => children.reduce((sum, child) => sum + (Number.isFinite(child.amount) ? child.amount : 0), 0),
    [children],
  );

  const form = useForm({
    defaultValues:
      initialValues ??
      ({
        title: "",
        amount: 0,
        category: "Outros",
        type: "VARIABLE",
        recurrence: "NONE",
        direction: "PAYABLE",
        personId: "",
        personName: "",
        children: [],
        dueDate: new Date().toISOString().slice(0, 10),
        notes: "",
      } satisfies DebtFormValues),
    validators: { onSubmit: createDebtSchema },
    onSubmit: ({ value }) =>
      startTransition(async () => {
        try {
          if (mode === "edit") {
            if (!debtId) throw new Error("debt_id_required");
            await updateDebt({
              id: debtId,
              ...value,
              amount: hasChildren ? childrenTotal : value.amount,
              children: hasChildren ? children : [],
            });
          } else {
            await createDebt({
              ...value,
              amount: hasChildren ? childrenTotal : value.amount,
              children: hasChildren ? children : [],
            });
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
      <form.Field name="title">
        {(field) => (
          <Field label="Título" error={field.state.meta.errors[0]?.message} className="sm:col-span-2">
            <input
              className={inputCls}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </Field>
        )}
      </form.Field>

      <form.Field name="direction">
        {(field) => (
          <Field label="Tipo de registro">
            <select
              className={inputCls}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value as "PAYABLE" | "RECEIVABLE")}
            >
              <option value="PAYABLE" className="bg-card">Eu devo</option>
              <option value="RECEIVABLE" className="bg-card">A pessoa me deve</option>
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
              value={hasChildren ? childrenTotal : field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              readOnly={hasChildren}
            />
          </Field>
        )}
      </form.Field>

      <form.Field name="dueDate">
        {(field) => (
          <Field label="Vencimento" error={field.state.meta.errors[0]?.message}>
            <input
              type="date"
              className={inputCls}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </Field>
        )}
      </form.Field>

      {form.state.values.direction === "RECEIVABLE" ? (
        <>
          <form.Field name="personId">
            {(field) => (
              <Field label="Pessoa relacionada">
                <select
                  className={inputCls}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                >
                  <option value="" className="bg-card">Selecionar pessoa existente</option>
                  {relatedPeople.map((p) => (
                    <option key={p.id} value={p.id} className="bg-card">
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </form.Field>

          <form.Field name="personName">
            {(field) => (
              <Field label="Ou nova pessoa" error={field.state.meta.errors[0]?.message}>
                <input
                  className={inputCls}
                  placeholder="Nome da pessoa"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </Field>
            )}
          </form.Field>
        </>
      ) : null}

      <form.Field name="category">
        {(field) => (
          <Field label="Categoria">
            <select
              className={inputCls}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-card">
                  {c}
                </option>
              ))}
            </select>
          </Field>
        )}
      </form.Field>

      <form.Field name="type">
        {(field) => (
          <Field label="Tipo">
            <select
              className={inputCls}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value as "FIXED" | "VARIABLE")}
            >
              <option value="VARIABLE" className="bg-card">Variável</option>
              <option value="FIXED" className="bg-card">Fixa</option>
            </select>
          </Field>
        )}
      </form.Field>

      <form.Field name="recurrence">
        {(field) => (
          <Field label="Recorrência">
            <select
              className={inputCls}
              value={field.state.value}
              onChange={(e) =>
                field.handleChange(e.target.value as "NONE" | "MONTHLY" | "WEEKLY" | "YEARLY")
              }
            >
              <option value="NONE" className="bg-card">Pontual</option>
              <option value="MONTHLY" className="bg-card">Mensal</option>
              <option value="WEEKLY" className="bg-card">Semanal</option>
              <option value="YEARLY" className="bg-card">Anual</option>
            </select>
          </Field>
        )}
      </form.Field>

      <form.Field name="notes">
        {(field) => (
          <Field label="Notas" className="sm:col-span-2">
            <textarea
              className={`${inputCls} min-h-[80px]`}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </Field>
        )}
      </form.Field>

      <div className="sm:col-span-2 rounded-[14px] border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-medium">Itens da dívida (filhas)</p>
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
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
              <div key={child.id ?? `new-${index}`} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px_auto]">
                <input
                  className={inputCls}
                  placeholder="Descrição do item"
                  value={child.title}
                  onChange={(e) =>
                    setChildren((curr) =>
                      curr.map((c, i) => (i === index ? { ...c, title: e.target.value } : c)),
                    )
                  }
                />
                <input
                  type="number"
                  step="0.01"
                  className={inputCls}
                  placeholder="Valor"
                  value={child.amount}
                  onChange={(e) =>
                    setChildren((curr) =>
                      curr.map((c, i) => (i === index ? { ...c, amount: Number(e.target.value) } : c)),
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() => setChildren((curr) => curr.filter((_, i) => i !== index))}
                  className="rounded-md border border-border px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
                >
                  Remover
                </button>
              </div>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setChildren((curr) => [...curr, { title: "", amount: 0 }])}
                className="rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-card/70"
              >
                Adicionar item
              </button>
              <p className="text-sm text-muted-foreground">
                Total dos itens: <span className="font-semibold text-foreground">{childrenTotal.toFixed(2)}</span>
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Quando ativado, o valor da dívida pai será calculado automaticamente pela soma dos itens.
          </p>
        )}
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-[18px] bg-primary py-4 text-sm font-semibold text-primary-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Salvando..." : mode === "edit" ? "Salvar alterações" : "Salvar registro"}
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
