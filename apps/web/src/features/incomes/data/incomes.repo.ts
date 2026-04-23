import { prisma } from "@valora/auth/prisma";

import type { IncomeFilters } from "../schemas";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export async function listIncomes(userId: string, filters: IncomeFilters = {}) {
  const where: {
    userId: string;
    type?: "CLT" | "PJ";
    date?: { gte: Date; lte: Date };
  } = { userId };

  if (filters.type) where.type = filters.type;

  if (filters.fromDate && filters.toDate) {
    where.date = {
      gte: new Date(`${filters.fromDate}T00:00:00`),
      lte: new Date(`${filters.toDate}T23:59:59.999`),
    };
  } else if (filters.month && filters.year) {
    const ref = new Date(filters.year, filters.month - 1, 1);
    where.date = { gte: startOfMonth(ref), lte: endOfMonth(ref) };
  }

  const incomes = await prisma.income.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return incomes.map((i) => ({
    id: i.id,
    type: i.type,
    amount: Number(i.amount),
    date: i.date.toISOString(),
    description: i.description,
    createdAt: i.createdAt.toISOString(),
  }));
}

export async function getIncomeById(userId: string, id: string) {
  const income = await prisma.income.findFirst({
    where: { id, userId },
  });
  if (!income) return null;

  return {
    id: income.id,
    type: income.type,
    amount: Number(income.amount),
    date: income.date.toISOString().slice(0, 10),
    description: income.description ?? "",
  };
}

export async function sumIncomeInRange(userId: string, start: Date, end: Date): Promise<number> {
  const agg = await prisma.income.aggregate({
    _sum: { amount: true },
    where: { userId, date: { gte: start, lte: end } },
  });
  return Number(agg._sum.amount ?? 0);
}

export async function groupIncomeByDay(userId: string, start: Date, end: Date) {
  const rows = await prisma.income.findMany({
    where: { userId, date: { gte: start, lte: end } },
    select: { amount: true, date: true },
  });
  const map = new Map<number, number>();
  for (const r of rows) {
    const day = r.date.getDate();
    map.set(day, (map.get(day) ?? 0) + Number(r.amount));
  }
  return map;
}
