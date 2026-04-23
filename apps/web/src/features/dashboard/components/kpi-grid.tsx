import type { DashboardData } from "../types";
import { KpiCard } from "./kpi-card";

export function KpiGrid({ data }: { data: DashboardData }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
      <KpiCard
        label="Saldo atual"
        value={data.balance}
        delta={data.deltas.balance}
        tone="primary"
        hint="Somatório das contas ativas"
      />
      <KpiCard
        label="Saldo projetado"
        value={data.projectedBalance}
        tone="positive"
        hint="Saldo atual + valores que vão te pagar"
      />
      <KpiCard
        label="Total de dívidas"
        value={data.totalDebt}
        delta={data.deltas.debt}
        hint="Faturas e empréstimos em aberto"
      />
      <KpiCard
        label="Total a receber"
        value={data.totalReceivable}
        hint="Valor em aberto que pessoas te devem"
      />
      <KpiCard
        label="Gastos do mês"
        value={data.monthExpense}
        delta={data.deltas.expense}
        hint="Transações de saída no mês"
      />
      <KpiCard
        label="Entradas do mês"
        value={data.monthIncome}
        delta={data.deltas.income}
        hint="Receitas recebidas no mês"
      />
    </div>
  );
}
