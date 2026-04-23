import { Calendar, Receipt, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";

import { deleteDebt } from "@/features/debts/actions/delete-debt";
import { settleDebt } from "@/features/debts/actions/settle-debt";
import { formatBRL, formatShortDate } from "@/lib/format";

type Debt = {
  id: string;
  title: string;
  amount: number;
  category: string;
  status: string;
  source: string;
  childCount: number;
  direction: "PAYABLE" | "RECEIVABLE";
  personName: string | null;
  dueDate: string;
};

export function DebtList({ debts }: { debts: Debt[] }) {
  if (debts.length === 0) {
    return (
      <div className="rounded-[18px] border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Nenhuma dívida cadastrada ainda.
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3">
      {debts.map((d) => (
        <li
          key={d.id}
          className="flex items-center justify-between rounded-[18px] border border-border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-black/30 text-muted-foreground">
              {d.source === "BILL" ? <Sparkles className="size-4" /> : <Receipt className="size-4" />}
            </span>
            <div>
              <p className="font-medium text-foreground">{d.title}</p>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                {formatShortDate(d.dueDate.slice(0, 10))} · {directionLabel(d.direction)}
                {d.personName ? ` · ${d.personName}` : ""} · {d.category} · {statusLabel(d.status)}
                {d.childCount > 0 ? ` · ${d.childCount} itens` : ""}
                {d.source === "BILL" && d.childCount > 0 ? " · Fatura" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">{formatBRL(d.amount)}</span>
            <form action={settleDebt.bind(null, d.id)}>
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs font-medium hover:bg-card/70"
              >
                {d.status === "PAID" ? "Reabrir" : "Dar baixa"}
              </button>
            </form>
            <Link
              href={`/debts/${d.id}/edit`}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs font-medium hover:bg-card/70"
            >
              Editar
            </Link>
            <form action={deleteDebt.bind(null, d.id)}>
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
  );
}

function directionLabel(direction: "PAYABLE" | "RECEIVABLE") {
  return direction === "RECEIVABLE" ? "Te devem" : "Você deve";
}

function statusLabel(s: string) {
  switch (s) {
    case "OPEN":
      return "Em aberto";
    case "PAID":
      return "Pago";
    case "OVERDUE":
      return "Vencida";
    case "CANCELED":
      return "Cancelada";
    default:
      return s;
  }
}
