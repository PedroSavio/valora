import { formatBRL, monthLabel } from "@/lib/format";

import type { DailyFlow } from "../types";

type Props = {
	data: DailyFlow[];
	periodDate?: Date;
};

const WIDTH = 860;
const HEIGHT = 320;
const PADDING = { top: 20, right: 18, bottom: 32, left: 18 };
const X_LABEL_INTERVAL = 6;

export function ExpenseTrendChart({ data, periodDate }: Props) {
	const chartW = WIDTH - PADDING.left - PADDING.right;
	const chartH = HEIGHT - PADDING.top - PADDING.bottom;

	let runningTotal = 0;
	const accumulated = data.map((item) => {
		runningTotal += item.expense;
		return { day: item.day, value: runningTotal };
	});

	const max = Math.max(1, ...accumulated.map((d) => d.value));
	const step =
		accumulated.length > 1 ? chartW / (accumulated.length - 1) : chartW;

	const points = accumulated
		.map((d, i) => {
			const x = PADDING.left + i * step;
			const y = PADDING.top + chartH - (d.value / max) * chartH;
			return `${x},${y}`;
		})
		.join(" ");

	const areaPoints = `${PADDING.left},${HEIGHT - PADDING.bottom} ${points} ${
		WIDTH - PADDING.right
	},${HEIGHT - PADDING.bottom}`;

	const total = accumulated.at(-1)?.value ?? 0;

	return (
		<section className="h-full rounded-[22px] border border-border bg-card p-6">
			<header className="mb-5 flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="font-semibold text-lg">
						Tendência de gastos acumulados
					</h2>
					<p className="text-muted-foreground text-sm capitalize">
						{monthLabel(periodDate)}
					</p>
				</div>
				<span className="rounded-full bg-destructive/15 px-3 py-1 font-medium text-destructive text-xs">
					Total: {formatBRL(total)}
				</span>
			</header>

			<svg
				viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
				className="h-80 w-full"
				role="img"
				aria-label="Gráfico de tendência acumulada de gastos"
			>
				<title>Gastos acumulados por dia</title>
				{[0.25, 0.5, 0.75, 1].map((ratio) => (
					<line
						key={ratio}
						x1={PADDING.left}
						x2={WIDTH - PADDING.right}
						y1={PADDING.top + chartH * (1 - ratio)}
						y2={PADDING.top + chartH * (1 - ratio)}
						stroke="currentColor"
						strokeOpacity={0.08}
					/>
				))}
				<polygon
					points={areaPoints}
					fill="var(--destructive)"
					fillOpacity={0.12}
				/>
				<polyline
					points={points}
					fill="none"
					stroke="var(--destructive)"
					strokeWidth={2.5}
				/>
				{accumulated.map((d, i) =>
					i % X_LABEL_INTERVAL === 0 ? (
						<text
							key={d.day}
							x={PADDING.left + i * step}
							y={HEIGHT - 8}
							textAnchor="middle"
							fill="currentColor"
							opacity={0.6}
							fontSize={11}
						>
							{d.day}
						</text>
					) : null,
				)}
			</svg>
		</section>
	);
}
