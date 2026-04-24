import { formatBRL, monthLabel } from "@/lib/format";

type Props = {
	userName: string;
	selectedMonth: number;
	selectedYear: number;
	totalTracked: number;
};

const MONTHS = Array.from({ length: 12 }, (_, monthIndex) => ({
	value: monthIndex + 1,
	label: new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(
		new Date(2026, monthIndex, 1),
	),
}));

function buildYearOptions(baseYear: number): number[] {
	return Array.from({ length: 7 }, (_, i) => baseYear - 4 + i);
}

export function DashboardHeader({
	userName,
	selectedMonth,
	selectedYear,
	totalTracked,
}: Props) {
	const selectedDate = new Date(selectedYear, selectedMonth - 1, 1);
	const yearOptions = buildYearOptions(new Date().getFullYear());

	return (
		<header className="flex flex-col gap-5 rounded-[22px] border border-border bg-card p-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:p-6">
			<div className="space-y-2">
				<p className="text-muted-foreground text-sm capitalize">
					{monthLabel(selectedDate)}
				</p>
				<h1 className="font-semibold text-2xl tracking-tight sm:text-3xl">
					Olá, {userName}
				</h1>
				<p className="text-muted-foreground text-sm">
					Total rastreado no período:{" "}
					<span className="font-semibold text-foreground">
						{formatBRL(totalTracked)}
					</span>
				</p>
			</div>

			<form
				className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end"
				method="get"
			>
				<label className="flex flex-col gap-1 text-muted-foreground text-xs">
					Mês
					<select
						name="month"
						defaultValue={String(selectedMonth)}
						className="h-10 w-full rounded-md border border-border bg-background px-3 text-foreground text-sm outline-none ring-primary/20 focus:ring-2 sm:min-w-36"
					>
						{MONTHS.map((month) => (
							<option key={month.value} value={month.value}>
								{month.label}
							</option>
						))}
					</select>
				</label>

				<label className="flex flex-col gap-1 text-muted-foreground text-xs">
					Ano
					<select
						name="year"
						defaultValue={String(selectedYear)}
						className="h-10 w-full rounded-md border border-border bg-background px-3 text-foreground text-sm outline-none ring-primary/20 focus:ring-2 sm:min-w-28"
					>
						{yearOptions.map((year) => (
							<option key={year} value={year}>
								{year}
							</option>
						))}
					</select>
				</label>

				<button
					type="submit"
					className="col-span-2 h-10 rounded-md bg-primary px-4 font-medium text-primary-foreground text-sm transition-opacity hover:opacity-90"
				>
					Aplicar
				</button>
			</form>
		</header>
	);
}
