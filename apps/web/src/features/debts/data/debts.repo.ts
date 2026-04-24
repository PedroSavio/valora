import { prisma } from "@valora/auth/prisma";

import { rangeFromISODates } from "@/lib/date";

import type { DebtFilters } from "../schemas";

type DebtWhere = {
	userId: string;
	parentDebtId: null;
	dueDate?: { gte: Date; lte: Date };
};

function buildDebtWhere(userId: string, filters: DebtFilters): DebtWhere {
	const where: DebtWhere = { userId, parentDebtId: null };

	if (filters.fromDate && filters.toDate) {
		where.dueDate = rangeFromISODates(filters.fromDate, filters.toDate);
	}

	return where;
}

export async function listDebts(userId: string, filters: DebtFilters = {}) {
	const debts = await prisma.debt.findMany({
		where: buildDebtWhere(userId, filters),
		orderBy: [{ status: "asc" }, { dueDate: "asc" }],
		include: { person: true, childDebts: { select: { id: true } } },
	});

	return debts.map((d) => ({
		...d,
		amount: Number(d.amount),
		personName: d.person?.name ?? null,
		childCount: d.childDebts.length,
		dueDate: d.dueDate.toISOString(),
		createdAt: d.createdAt.toISOString(),
		updatedAt: d.updatedAt.toISOString(),
		paidAt: d.paidAt?.toISOString() ?? null,
	}));
}

export async function getDebtById(userId: string, id: string) {
	const debt = await prisma.debt.findFirst({
		where: { id, userId },
		include: {
			childDebts: {
				orderBy: { createdAt: "asc" },
				select: { id: true, title: true, amount: true },
			},
		},
	});
	if (!debt) return null;

	return {
		id: debt.id,
		title: debt.title,
		amount: Number(debt.amount),
		category: debt.category,
		type: debt.type,
		recurrence: debt.recurrence,
		direction: debt.direction,
		personId: debt.personId ?? "",
		dueDate: debt.dueDate.toISOString().slice(0, 10),
		notes: debt.notes ?? "",
		children: debt.childDebts.map((c) => ({
			id: c.id,
			title: c.title,
			amount: Number(c.amount),
		})),
	};
}

export async function listUpcomingDebts(userId: string, limit = 5) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const baseWhere = {
		userId,
		parentDebtId: null,
		status: "OPEN" as const,
		direction: "PAYABLE" as const,
	};

	const upcoming = await prisma.debt.findMany({
		where: { ...baseWhere, dueDate: { gte: today } },
		orderBy: { dueDate: "asc" },
		take: limit,
	});

	const debts =
		upcoming.length > 0
			? upcoming
			: await prisma.debt.findMany({
					where: baseWhere,
					orderBy: { dueDate: "asc" },
					take: limit,
				});

	return debts.map((d) => ({
		id: d.id,
		title: d.title,
		amount: Number(d.amount),
		dueDate: d.dueDate.toISOString(),
		category: d.category,
	}));
}
