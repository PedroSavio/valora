import { prisma } from "@valora/auth/prisma";

import { listUpcomingDebts } from "@/features/debts/data/debts.repo";
import {
	groupIncomeByDay,
	sumIncomeInRange,
	sumTaxDueInRange,
} from "@/features/incomes/data/incomes.repo";

import type { DailyFlow, DashboardData, KpiDelta } from "../types";

const FLAT_DELTA: KpiDelta = { direction: "flat", percent: 0 };

function startOfMonth(d: Date) {
	return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
	return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
function previousMonth(d: Date) {
	return new Date(d.getFullYear(), d.getMonth() - 1, 1);
}

function emptyDailyFlow(d: Date): DailyFlow[] {
	const end = endOfMonth(d);
	return Array.from({ length: end.getDate() }, (_, i) => ({
		day: i + 1,
		income: 0,
		expense: 0,
	}));
}

function delta(current: number, previous: number): KpiDelta {
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
			where: {
				userId,
				parentDebtId: null,
				status: "OPEN",
				direction: "PAYABLE",
			},
		}),
		prisma.debt.aggregate({
			_sum: { amount: true },
			where: {
				userId,
				parentDebtId: null,
				direction: "PAYABLE",
				dueDate: { gte: monthStart, lte: monthEnd },
			},
		}),
		prisma.debt.aggregate({
			_sum: { amount: true },
			where: {
				userId,
				parentDebtId: null,
				direction: "PAYABLE",
				dueDate: { gte: prevStart, lte: prevEnd },
			},
		}),
		prisma.debt.findMany({
			where: {
				userId,
				parentDebtId: null,
				direction: "PAYABLE",
				dueDate: { gte: monthStart, lte: monthEnd },
			},
			select: { amount: true, dueDate: true },
		}),
		sumIncomeInRange(userId, monthStart, monthEnd),
		sumIncomeInRange(userId, prevStart, prevEnd),
		groupIncomeByDay(userId, monthStart, monthEnd),
		prisma.income.aggregate({ _sum: { amount: true }, where: { userId } }),
		prisma.debt.aggregate({
			_sum: { amount: true },
			where: {
				userId,
				parentDebtId: null,
				status: "PAID",
				direction: "PAYABLE",
			},
		}),
		prisma.debt.aggregate({
			_sum: { amount: true },
			where: {
				userId,
				parentDebtId: null,
				status: "OPEN",
				direction: "RECEIVABLE",
			},
		}),
		prisma.debt.findMany({
			where: {
				userId,
				parentDebtId: null,
				status: "OPEN",
				direction: "RECEIVABLE",
			},
			select: {
				personId: true,
				amount: true,
				person: {
					select: {
						name: true,
					},
				},
			},
		}),
		listUpcomingDebts(userId, 5),
		sumTaxDueInRange(userId, prevStart, prevEnd),
	]);

	const dailyFlow = emptyDailyFlow(periodDate);
	for (const d of monthDebts) {
		const idx = d.dueDate.getDate() - 1;
		if (dailyFlow[idx]) dailyFlow[idx].expense += Number(d.amount);
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
	const projectedBalance = balance + totalReceivable;

	const aggregatedByName = new Map<
		string,
		{ personId: string | null; name: string; amount: number; debtCount: number }
	>();
	for (const row of receivablesRows) {
		const rawName = row.person?.name?.trim() || "Sem pessoa vinculada";
		const key = rawName.toLocaleLowerCase("pt-BR");
		const current = aggregatedByName.get(key);
		if (current) {
			current.amount += Number(row.amount);
			current.debtCount += 1;
			if (!current.personId && row.personId) current.personId = row.personId;
		} else {
			aggregatedByName.set(key, {
				personId: row.personId,
				name: rawName,
				amount: Number(row.amount),
				debtCount: 1,
			});
		}
	}
	const owingPeople = Array.from(aggregatedByName.values())
		.sort((a, b) => b.amount - a.amount)
		.slice(0, 8);

	return {
		userName,
		balance,
		projectedBalance,
		totalDebt,
		totalReceivable,
		monthExpense,
		monthIncome,
		monthTaxDue,
		deltas: {
			balance: FLAT_DELTA,
			debt: FLAT_DELTA,
			expense: delta(monthExpense, prevMonthExpense),
			income: delta(monthIncome, prevMonthIncome),
		},
		upcomingBills: upcoming.map((d) => ({
			id: d.id,
			title: d.title,
			amount: d.amount,
			dueDate: d.dueDate,
			category: d.category,
		})),
		owingPeople,
		dailyFlow,
	};
}
