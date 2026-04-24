import { DashboardGrid } from "@/features/dashboard/components/dashboard-grid";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { ExpenseTrendChart } from "@/features/dashboard/components/expense-trend-chart";
import { IncomeExpenseChart } from "@/features/dashboard/components/income-expense-chart";
import { KpiCard } from "@/features/dashboard/components/kpi-card";
import { PeopleOwing } from "@/features/dashboard/components/people-owing";
import { ReceivablesSummary } from "@/features/dashboard/components/receivables-summary";
import { UpcomingBills } from "@/features/dashboard/components/upcoming-bills";
import { WeeklyExpenseChart } from "@/features/dashboard/components/weekly-expense-chart";
import { DEFAULT_LAYOUTS } from "@/features/dashboard/dashboard.layouts";
import { getDashboardData } from "@/features/dashboard/data/dashboard.repo";
import { pickParam } from "@/lib/search-params";
import { requireSession } from "@/lib/session";

type DashboardSearchParams = {
	month?: string | string[];
	year?: string | string[];
};

function parseSelectedDate(searchParams?: DashboardSearchParams): Date {
	const now = new Date();
	const parsedMonth = Number(pickParam(searchParams?.month));
	const parsedYear = Number(pickParam(searchParams?.year));

	const month =
		Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
			? parsedMonth
			: now.getMonth() + 1;
	const year =
		Number.isInteger(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100
			? parsedYear
			: now.getFullYear();

	return new Date(year, month - 1, 1);
}

export default async function DashboardPage({
	searchParams,
}: {
	searchParams?: Promise<DashboardSearchParams>;
}) {
	const session = await requireSession();
	const selectedDate = parseSelectedDate(await searchParams);

	const data = await getDashboardData(
		session.user.id,
		session.user.name ?? "",
		selectedDate,
	);

	const totalTracked = data.monthExpense + data.monthIncome;
	const owingPeopleCount = data.owingPeople.length;
	const owingEntriesCount = data.owingPeople.reduce(
		(sum, person) => sum + person.debtCount,
		0,
	);

	const items = [
		{
			id: "kpi-balance",
			node: (
				<KpiCard
					label="Saldo atual"
					value={data.balance}
					delta={data.deltas.balance}
					tone="primary"
					hint="Somatório das contas ativas"
				/>
			),
		},
		{
			id: "kpi-projected-balance",
			node: (
				<KpiCard
					label="Saldo projetado"
					value={data.projectedBalance}
					tone="positive"
					hint="Saldo atual + valores que vão te pagar"
				/>
			),
		},
		{
			id: "kpi-total-debt",
			node: (
				<KpiCard
					label="Total de dívidas"
					value={data.totalDebt}
					delta={data.deltas.debt}
					hint="Faturas e empréstimos em aberto"
				/>
			),
		},
		{
			id: "kpi-total-receivable",
			node: (
				<KpiCard
					label="Total a receber"
					value={data.totalReceivable}
					hint="Valor em aberto que pessoas te devem"
				/>
			),
		},
		{
			id: "kpi-month-expense",
			node: (
				<KpiCard
					label="Gastos do mês"
					value={data.monthExpense}
					delta={data.deltas.expense}
					hint="Transações de saída no mês"
				/>
			),
		},
		{
			id: "kpi-month-income",
			node: (
				<KpiCard
					label="Entradas do mês"
					value={data.monthIncome}
					delta={data.deltas.income}
					hint="Receitas recebidas no mês"
				/>
			),
		},
		{
			id: "kpi-month-tax-due",
			node: (
				<KpiCard
					label="Imposto a pagar no mês"
					value={data.monthTaxDue}
					tone="negative"
					hint="Imposto das entradas PJ do mês anterior"
				/>
			),
		},
		{
			id: "income-expense",
			node: (
				<IncomeExpenseChart data={data.dailyFlow} periodDate={selectedDate} />
			),
		},
		{
			id: "upcoming-bills",
			node: <UpcomingBills bills={data.upcomingBills} />,
		},
		{ id: "people-owing", node: <PeopleOwing people={data.owingPeople} /> },
		{
			id: "receivables",
			node: (
				<ReceivablesSummary
					totalReceivable={data.totalReceivable}
					projectedBalance={data.projectedBalance}
					peopleCount={owingPeopleCount}
					entriesCount={owingEntriesCount}
				/>
			),
		},
		{
			id: "expense-trend",
			node: (
				<ExpenseTrendChart data={data.dailyFlow} periodDate={selectedDate} />
			),
		},
		{
			id: "weekly-expense",
			node: (
				<WeeklyExpenseChart data={data.dailyFlow} periodDate={selectedDate} />
			),
		},
	];

	return (
		<div className="mx-auto w-full max-w-[1440px] space-y-6 p-6 lg:p-10">
			<DashboardHeader
				userName={data.userName}
				selectedMonth={selectedDate.getMonth() + 1}
				selectedYear={selectedDate.getFullYear()}
				totalTracked={totalTracked}
			/>
			<DashboardGrid items={items} defaultLayouts={DEFAULT_LAYOUTS} />
		</div>
	);
}
