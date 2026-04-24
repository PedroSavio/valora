import { formatBRL, monthLabel } from "@/lib/format";

import type { DailyFlow } from "../types";

type Props = {
	data: DailyFlow[];
	periodDate?: Date;
};

type WeekExpense = {
	label: string;
	value: number;
};

function buildWeeklyExpenses(data: DailyFlow[]): WeekExpense[] {
	const totalWeeks = Math.max(1, Math.ceil(data.length / 7));
	return Array.from({ length: totalWeeks }, (_, weekIndex) => {
		const start = weekIndex * 7;
		const value = data
			.slice(start, start + 7)
			.reduce((sum, day) => sum + day.expense, 0);
		return {
			label: `Sem ${weekIndex + 1}`,
			value,
		};
	});
}

export function WeeklyExpenseChart({ data, periodDate }: Props) {
	const weeks = buildWeeklyExpenses(data);
	const max = Math.max(1, ...weeks.map((w) => w.value));

	return (
		<section className="h-full rounded-[22px] border border-border bg-card p-6">
			<header className="mb-6">
				<h2 className="font-semibold text-lg">Distribuição semanal</h2>
				<p className="text-muted-foreground text-sm capitalize">
					{monthLabel(periodDate)}
				</p>
			</header>

			<div className="space-y-5">
				{weeks.map((week) => {
					const width = `${Math.max(6, (week.value / max) * 100)}%`;
					return (
						<div key={week.label} className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="font-medium text-foreground">
									{week.label}
								</span>
								<span className="font-semibold text-foreground">
									{formatBRL(week.value)}
								</span>
							</div>
							<div className="h-3 rounded-full bg-muted">
								<div
									className="h-full rounded-full bg-destructive transition-all duration-500"
									style={{ width }}
									aria-hidden
								/>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
