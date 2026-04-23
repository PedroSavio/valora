import { Briefcase, Building2, Trash2 } from "lucide-react";
import Link from "next/link";

import { formatBRL, formatShortDate } from "@/lib/format";

import { deleteIncome } from "../actions/delete-income";

type Income = {
  id: string;
  type: "CLT" | "PJ";
  amount: number;
  date: string;
  description: string | null;
};

export function IncomeList({ incomes }: { incomes: Income[] }) {
  if (incomes.length === 0) {
    return (
      <div className="rounded-[18px] border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Nenhuma entrada registrada no período selecionado.
      </div>
    );
  }

  const total = incomes.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-1 gap-3">
        {incomes.map((i) => (
          <li
            key={i.id}
            className="flex items-center justify-between rounded-[18px] border border-border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex size-10 items-center justify-center rounded-full ${
                  i.type === "CLT" ? "bg-primary/15 text-primary" : "bg-blue-500/15 text-blue-400"
                }`}
              >
                {i.type === "CLT" ? <Briefcase className="size-4" /> : <Building2 className="size-4" />}
              </span>
              <div>
                <p className="font-medium text-foreground">
                  {i.type === "CLT" ? "Salário CLT" : "Recebimento PJ"}
                  {i.description ? ` · ${i.description}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">{formatShortDate(i.date.slice(0, 10))}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-primary">{formatBRL(i.amount)}</span>
              <Link
                href={`/incomes/${i.id}/edit`}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs font-medium hover:bg-card/70"
              >
                Editar
              </Link>
              <form action={deleteIncome.bind(null, i.id)}>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs font-medium text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-3.5" />
                  Excluir
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between rounded-[18px] border border-border bg-card px-4 py-3 text-sm">
        <span className="text-muted-foreground">{incomes.length} entrada(s)</span>
        <span className="font-semibold text-foreground">Total: {formatBRL(total)}</span>
      </div>
    </div>
  );
}
