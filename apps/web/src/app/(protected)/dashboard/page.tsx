import { auth } from "@valora/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type RGL from "react-grid-layout";

import { DashboardGrid } from "@/features/dashboard/components/dashboard-grid";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { ExpenseTrendChart } from "@/features/dashboard/components/expense-trend-chart";
import { IncomeExpenseChart } from "@/features/dashboard/components/income-expense-chart";
import { KpiCard } from "@/features/dashboard/components/kpi-card";
import { PeopleOwing } from "@/features/dashboard/components/people-owing";
import { ReceivablesSummary } from "@/features/dashboard/components/receivables-summary";
import { UpcomingBills } from "@/features/dashboard/components/upcoming-bills";
import { WeeklyExpenseChart } from "@/features/dashboard/components/weekly-expense-chart";
import { getDashboardData } from "@/features/dashboard/data/dashboard.repo";

type Layouts = RGL.Layouts;

type DashboardSearchParams = {
	month?: string | string[];
	year?: string | string[];
};

function parseSelectedDate(searchParams?: DashboardSearchParams): Date {
	const monthRaw = Array.isArray(searchParams?.month)
		? searchParams?.month[0]
		: searchParams?.month;
	const yearRaw = Array.isArray(searchParams?.year)
		? searchParams?.year[0]
		: searchParams?.year;

	const now = new Date();
	const parsedMonth = Number(monthRaw);
	const parsedYear = Number(yearRaw);

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

const KPI_MIN = { minW: 2, minH: 4 };

const DEFAULT_LAYOUTS: Layouts = {
	lg: [
		{ i: "kpi-balance", x: 0, y: 0, w: 4, h: 7, ...KPI_MIN },
		{ i: "kpi-projected-balance", x: 4, y: 0, w: 4, h: 7, ...KPI_MIN },
		{ i: "kpi-total-debt", x: 8, y: 0, w: 4, h: 7, ...KPI_MIN },
		{ i: "kpi-total-receivable", x: 0, y: 7, w: 4, h: 7, ...KPI_MIN },
		{ i: "kpi-month-expense", x: 4, y: 7, w: 4, h: 7, ...KPI_MIN },
		{ i: "kpi-month-income", x: 8, y: 7, w: 4, h: 7, ...KPI_MIN },
		{ i: "kpi-month-tax-due", x: 0, y: 14, w: 4, h: 7, ...KPI_MIN },
		{ i: "income-expense", x: 0, y: 21, w: 8, h: 13, minW: 4, minH: 8 },
		{ i: "upcoming-bills", x: 8, y: 21, w: 4, h: 7, minW: 3, minH: 5 },
		{ i: "people-owing", x: 8, y: 28, w: 4, h: 7, minW: 3, minH: 5 },
		{ i: "receivables", x: 8, y: 35, w: 4, h: 6, minW: 3, minH: 4 },
		{ i: "expense-trend", x: 0, y: 34, w: 7, h: 12, minW: 4, minH: 8 },
		{ i: "weekly-expense", x: 7, y: 41, w: 5, h: 12, minW: 3, minH: 8 },
	],
	md: [
		{ i: "kpi-balance", x: 0, y: 0, w: 4, h: 7, ...KPI_MIN },
		{ i: "kpi-projected-balance", x: 4, y: 0, w: 4, h: 7, ...KPI_MIN },
		{ i: "kpi-total-debt", x: 0, y: 7, w: 4, h: 7, ...KPI_MIN },
		{ i: "kpi-total-receivable", x: 4, y: 7, w: 4, h: 7, ...KPI_MIN },
		{ i: "kpi-month-expense", x: 0, y: 14, w: 4, h: 7, ...KPI_MIN },
		{ i: "kpi-month-income", x: 4, y: 14, w: 4, h: 7, ...KPI_MIN },
		{ i: "kpi-month-tax-due", x: 0, y: 21, w: 8, h: 7, ...KPI_MIN },
		{ i: "income-expense", x: 0, y: 28, w: 8, h: 12, minW: 4, minH: 8 },
		{ i: "upcoming-bills", x: 0, y: 40, w: 4, h: 7, minW: 3, minH: 5 },
		{ i: "people-owing", x: 4, y: 40, w: 4, h: 7, minW: 3, minH: 5 },
		{ i: "receivables", x: 0, y: 47, w: 4, h: 6, minW: 3, minH: 4 },
		{ i: "expense-trend", x: 4, y: 47, w: 4, h: 11, minW: 4, minH: 8 },
		{ i: "weekly-expense", x: 0, y: 58, w: 8, h: 11, minW: 3, minH: 8 },
	],
	sm: [
		{ i: "kpi-balance", x: 0, y: 0, w: 4, h: 7, ...KPI_MIN },
		{ i: "kpi-projected-balance", x: 0, y: 7, w: 4, h: 7, ...KPI_MIN },
		{ i: "kpi-total-debt", x: 0, y: 14, w: 4, h: 7, ...KPI_MIN },
		{ i: "kpi-total-receivable", x: 0, y: 21, w: 4, h: 7, ...KPI_MIN },
		{ i: "kpi-month-expense", x: 0, y: 28, w: 4, h: 7, ...KPI_MIN },
		{ i: "kpi-month-income", x: 0, y: 35, w: 4, h: 7, ...KPI_MIN },
		{ i: "kpi-month-tax-due", x: 0, y: 42, w: 4, h: 7, ...KPI_MIN },
		{ i: "income-expense", x: 0, y: 49, w: 4, h: 12, minW: 2, minH: 8 },
		{ i: "upcoming-bills", x: 0, y: 61, w: 4, h: 7, minW: 2, minH: 5 },
		{ i: "people-owing", x: 0, y: 68, w: 4, h: 7, minW: 2, minH: 5 },
		{ i: "receivables", x: 0, y: 75, w: 4, h: 6, minW: 2, minH: 4 },
		{ i: "expense-trend", x: 0, y: 81, w: 4, h: 11, minW: 2, minH: 8 },
		{ i: "weekly-expense", x: 0, y: 92, w: 4, h: 11, minW: 2, minH: 8 },
	],
};

export default async function DashboardPage({
	searchParams,
}: {
	searchParams?: Promise<DashboardSearchParams>;
}) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) redirect("/login");

	const resolvedSearchParams = await searchParams;
	const selectedDate = parseSelectedDate(resolvedSearchParams);

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
		{ id: "upcoming-bills", node: <UpcomingBills bills={data.upcomingBills} /> },
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
