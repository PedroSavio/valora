import { CalendarClock } from "lucide-react";

import { formatBRL, formatShortDate } from "@/lib/format";

import type { UpcomingBill } from "../types";

export function UpcomingBills({ bills }: { bills: UpcomingBill[] }) {
  return (
    <section className="h-full rounded-[22px] border border-border bg-card p-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Próximas contas a vencer</h2>
          <p className="text-sm text-muted-foreground">Ordenadas pelo vencimento</p>
        </div>
        <CalendarClock className="size-5 text-muted-foreground" />
      </header>
      {bills.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma conta em aberto no momento.</p>
      ) : (
        <ul className="divide-y divide-border">
          {bills.map((bill) => (
            <li key={bill.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div>
                <p className="font-medium text-foreground">{bill.title}</p>
                <p className="text-sm text-muted-foreground">
                  {bill.category} · vence em {formatShortDate(bill.dueDate)}
                </p>
              </div>
              <span className="text-base font-semibold">{formatBRL(bill.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
