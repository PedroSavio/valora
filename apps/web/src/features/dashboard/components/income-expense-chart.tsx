import { formatBRL, monthLabel } from "@/lib/format";

import type { DailyFlow } from "../types";

type Props = {
  data: DailyFlow[];
  periodDate?: Date;
};

const WIDTH = 920;
const HEIGHT = 320;
const PADDING = { top: 20, right: 20, bottom: 30, left: 20 };

export function IncomeExpenseChart({ data, periodDate }: Props) {
  const chartW = WIDTH - PADDING.left - PADDING.right;
  const chartH = HEIGHT - PADDING.top - PADDING.bottom;
  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));
  const slot = chartW / data.length;
  const barW = Math.max(2, slot / 2.6);

  const totalIncome = data.reduce((s, d) => s + d.income, 0);
  const totalExpense = data.reduce((s, d) => s + d.expense, 0);

  return (
    <section className="rounded-[22px] border border-border bg-card p-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Entradas × Saídas</h2>
          <p className="text-sm capitalize text-muted-foreground">{monthLabel(periodDate)}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <LegendDot label={`Entradas · ${formatBRL(totalIncome)}`} color="var(--primary)" />
          <LegendDot label={`Saídas · ${formatBRL(totalExpense)}`} color="#ef4444" />
        </div>
      </header>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-80 w-full"
        role="img"
        aria-label="Gráfico entradas e saídas por dia"
      >
        <title>Entradas e saídas por dia</title>
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <line
            key={r}
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={PADDING.top + chartH * (1 - r)}
            y2={PADDING.top + chartH * (1 - r)}
            stroke="currentColor"
            strokeOpacity={0.08}
          />
        ))}
        {data.map((d, i) => {
          const x = PADDING.left + i * slot + (slot - barW * 2 - 2) / 2;
          const incomeH = (d.income / max) * chartH;
          const expenseH = (d.expense / max) * chartH;
          return (
            <g key={d.day}>
              <rect
                x={x}
                y={PADDING.top + chartH - incomeH}
                width={barW}
                height={incomeH}
                rx={2}
                fill="var(--primary)"
              />
              <rect
                x={x + barW + 2}
                y={PADDING.top + chartH - expenseH}
                width={barW}
                height={expenseH}
                rx={2}
                fill="#ef4444"
                opacity={0.85}
              />
            </g>
          );
        })}
        {data
          .filter((_, i) => i % 5 === 0)
          .map((d) => {
            const idx = data.findIndex((x) => x.day === d.day);
            const x = PADDING.left + idx * slot + slot / 2;
            return (
              <text
                key={d.day}
                x={x}
                y={HEIGHT - 6}
                textAnchor="middle"
                fill="currentColor"
                opacity={0.6}
                fontSize={11}
              >
                {d.day}
              </text>
            );
          })}
      </svg>
    </section>
  );
}

function LegendDot({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-muted-foreground">
      <span className="inline-block size-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
