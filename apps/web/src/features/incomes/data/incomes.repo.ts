import { prisma } from "@valora/auth/prisma";

import { endOfMonth, rangeFromISODates, startOfMonth } from "@/lib/date";

import type { IncomeFilters } from "../schemas";

type IncomeWhere = {
	userId: string;
	type?: "CLT" | "PJ";
	date?: { gte: Date; lte: Date };
};

function buildIncomeWhere(userId: string, filters: IncomeFilters): IncomeWhere {
	const where: IncomeWhere = { userId };

	if (filters.type) where.type = filters.type;

	if (filters.fromDate && filters.toDate) {
		where.date = rangeFromISODates(filters.fromDate, filters.toDate);
	} else if (filters.month && filters.year) {
		const ref = new Date(filters.year, filters.month - 1, 1);
		where.date = { gte: startOfMonth(ref), lte: endOfMonth(ref) };
	}

	return where;
}

export async function listIncomes(userId: string, filters: IncomeFilters = {}) {
	const incomes = await prisma.income.findMany({
		where: buildIncomeWhere(userId, filters),
		orderBy: { date: "desc" },
	});

	return incomes.map((i) => ({
		id: i.id,
		type: i.type,
		amount: Number(i.amount),
		taxRate: Number(i.taxRate),
		date: i.date.toISOString(),
		description: i.description,
		createdAt: i.createdAt.toISOString(),
	}));
}

export async function getIncomeById(userId: string, id: string) {
	const income = await prisma.income.findFirst({ where: { id, userId } });
	if (!income) return null;

	return {
		id: income.id,
		type: income.type,
		amount: Number(income.amount),
		taxRate: Number(income.taxRate),
		date: income.date.toISOString().slice(0, 10),
		description: income.description ?? "",
	};
}

export async function sumIncomeInRange(
	userId: string,
	start: Date,
	end: Date,
): Promise<number> {
	const agg = await prisma.income.aggregate({
		_sum: { amount: true },
		where: { userId, date: { gte: start, lte: end } },
	});
	return Number(agg._sum.amount ?? 0);
}

export async function sumTaxDueInRange(
	userId: string,
	start: Date,
	end: Date,
): Promise<number> {
	const rows = await prisma.income.findMany({
		where: { userId, type: "PJ", date: { gte: start, lte: end } },
		select: { amount: true, taxRate: true },
	});
	return rows.reduce(
		(sum, r) => sum + (Number(r.amount) * Number(r.taxRate)) / 100,
		0,
	);
}

export async function groupIncomeByDay(userId: string, start: Date, end: Date) {
	const rows = await prisma.income.findMany({
		where: { userId, date: { gte: start, lte: end } },
		select: { amount: true, date: true },
	});
	const byDay = new Map<number, number>();
	for (const row of rows) {
		const day = row.date.getDate();
		byDay.set(day, (byDay.get(day) ?? 0) + Number(row.amount));
	}
	return byDay;
}
