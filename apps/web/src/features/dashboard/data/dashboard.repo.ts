import { prisma } from "@valora/auth/prisma";

import { listUpcomingDebts } from "@/features/debts/data/debts.repo";
import {
	groupIncomeByDay,
	sumIncomeInRange,
	sumTaxDueInRange,
} from "@/features/incomes/data/incomes.repo";
import { endOfMonth, previousMonth, startOfMonth } from "@/lib/date";

import type { DailyFlow, DashboardData, KpiDelta, OwingPerson } from "../types";

const FLAT_DELTA: KpiDelta = { direction: "flat", percent: 0 };
const MAX_OWING_PEOPLE = 8;
const UPCOMING_BILLS_LIMIT = 5;

type ReceivableRow = {
	personId: string | null;
	amount: { toString(): string } | number;
	person: { name: string | null } | null;
};

function emptyDailyFlow(date: Date): DailyFlow[] {
	const lastDay = endOfMonth(date).getDate();
	return Array.from({ length: lastDay }, (_, i) => ({
		day: i + 1,
		income: 0,
		expense: 0,
	}));
}

function calculateDelta(current: number, previous: number): KpiDelta {
	if (previous === 0) {
		if (current === 0) return FLAT_DELTA;
		return { direction: "up", percent: 100 };
	}
	const diff = ((current - previous) / previous) * 100;
	if (Math.abs(diff) < 0.05) return FLAT_DELTA;
	return {
		direction: diff > 0 ? "up" : "down",
		percent: Math.abs(Number(diff.toFixed(1))),
	};
}

function aggregateOwingPeople(rows: ReceivableRow[]): OwingPerson[] {
	const byKey = new Map<string, OwingPerson>();

	for (const row of rows) {
		const rawName = row.person?.name?.trim() || "Sem pessoa vinculada";
		const key = rawName.toLocaleLowerCase("pt-BR");
		const amount = Number(row.amount);
		const current = byKey.get(key);

		if (current) {
			current.amount += amount;
			current.debtCount += 1;
			if (!current.personId && row.personId) current.personId = row.personId;
		} else {
			byKey.set(key, {
				personId: row.personId,
				name: rawName,
				amount,
				debtCount: 1,
			});
		}
	}

	return Array.from(byKey.values())
		.sort((a, b) => b.amount - a.amount)
		.slice(0, MAX_OWING_PEOPLE);
}

export async function getDashboardData(
	userId: string,
	userName: string,
	periodDate = new Date(),
): Promise<DashboardData> {
	const monthStart = startOfMonth(periodDate);
	const monthEnd = endOfMonth(periodDate);
	const prevRef = previousMonth(periodDate);
	const prevStart = startOfMonth(prevRef);
	const prevEnd = endOfMonth(prevRef);

	const monthRange = { gte: monthStart, lte: monthEnd };
	const prevMonthRange = { gte: prevStart, lte: prevEnd };
	const baseDebtFilter = { userId, parentDebtId: null } as const;

	const [
		openAgg,
		monthDebtsAgg,
		prevMonthDebtsAgg,
		monthDebts,
		monthIncome,
		prevMonthIncome,
		incomeByDay,
		allTimeIncome,
		paidDebtsAgg,
		receivablesAgg,
		receivablesRows,
		upcoming,
		monthTaxDue,
	] = await Promise.all([
		prisma.debt.aggregate({
			_sum: { amount: true },
			where: { ...baseDebtFilter, status: "OPEN", direction: "PAYABLE" },
		}),
		prisma.debt.aggregate({
			_sum: { amount: true },
			where: { ...baseDebtFilter, direction: "PAYABLE", dueDate: monthRange },
		}),
		prisma.debt.aggregate({
			_sum: { amount: true },
			where: {
				...baseDebtFilter,
				direction: "PAYABLE",
				dueDate: prevMonthRange,
			},
		}),
		prisma.debt.findMany({
			where: { ...baseDebtFilter, direction: "PAYABLE", dueDate: monthRange },
			select: { amount: true, dueDate: true },
		}),
		sumIncomeInRange(userId, monthStart, monthEnd),
		sumIncomeInRange(userId, prevStart, prevEnd),
		groupIncomeByDay(userId, monthStart, monthEnd),
		prisma.income.aggregate({ _sum: { amount: true }, where: { userId } }),
		prisma.debt.aggregate({
			_sum: { amount: true },
			where: { ...baseDebtFilter, status: "PAID", direction: "PAYABLE" },
		}),
		prisma.debt.aggregate({
			_sum: { amount: true },
			where: { ...baseDebtFilter, status: "OPEN", direction: "RECEIVABLE" },
		}),
		prisma.debt.findMany({
			where: { ...baseDebtFilter, status: "OPEN", direction: "RECEIVABLE" },
			select: {
				personId: true,
				amount: true,
				person: { select: { name: true } },
			},
		}),
		listUpcomingDebts(userId, UPCOMING_BILLS_LIMIT),
		sumTaxDueInRange(userId, prevStart, prevEnd),
	]);

	const dailyFlow = emptyDailyFlow(periodDate);
	for (const debt of monthDebts) {
		const idx = debt.dueDate.getDate() - 1;
		if (dailyFlow[idx]) dailyFlow[idx].expense += Number(debt.amount);
	}
	for (const [day, amount] of incomeByDay) {
		const idx = day - 1;
		if (dailyFlow[idx]) dailyFlow[idx].income += amount;
	}

	const totalDebt = Number(openAgg._sum.amount ?? 0);
	const totalReceivable = Number(receivablesAgg._sum.amount ?? 0);
	const monthExpense = Number(monthDebtsAgg._sum.amount ?? 0);
	const prevMonthExpense = Number(prevMonthDebtsAgg._sum.amount ?? 0);
	const balance =
		Number(allTimeIncome._sum.amount ?? 0) -
		Number(paidDebtsAgg._sum.amount ?? 0);

	return {
		userName,
		balance,
		projectedBalance: balance + totalReceivable,
		totalDebt,
		totalReceivable,
		monthExpense,
		monthIncome,
		monthTaxDue,
		deltas: {
			balance: FLAT_DELTA,
			debt: FLAT_DELTA,
			expense: calculateDelta(monthExpense, prevMonthExpense),
			income: calculateDelta(monthIncome, prevMonthIncome),
		},
		upcomingBills: upcoming.map((d) => ({
			id: d.id,
			title: d.title,
			amount: d.amount,
			dueDate: d.dueDate,
			category: d.category,
		})),
		owingPeople: aggregateOwingPeople(receivablesRows),
		dailyFlow,
	};
}
