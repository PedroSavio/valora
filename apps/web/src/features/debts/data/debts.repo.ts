import { prisma } from "@valora/auth/prisma";
import type { DebtFilters } from "../schemas";

export async function listDebts(userId: string, filters: DebtFilters = {}) {
  const where: {
    userId: string;
    dueDate?: { gte: Date; lte: Date };
  } = { userId };

  if (filters.fromDate && filters.toDate) {
    where.dueDate = {
      gte: new Date(`${filters.fromDate}T00:00:00`),
      lte: new Date(`${filters.toDate}T23:59:59.999`),
    };
  }

  const debts = await prisma.debt.findMany({
    where,
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    include: { person: true },
  });
  return debts.map((d) => ({
    ...d,
    amount: Number(d.amount),
    personName: d.person?.name ?? null,
    dueDate: d.dueDate.toISOString(),
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
    paidAt: d.paidAt?.toISOString() ?? null,
  }));
}

export async function getDebtById(userId: string, id: string) {
  const debt = await prisma.debt.findFirst({
    where: { id, userId },
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
  };
}

export async function listUpcomingDebts(userId: string, limit = 5) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let debts = await prisma.debt.findMany({
    where: { userId, status: "OPEN", direction: "PAYABLE", dueDate: { gte: today } },
    orderBy: { dueDate: "asc" },
    take: limit,
  });

  if (debts.length === 0) {
    debts = await prisma.debt.findMany({
      where: { userId, status: "OPEN", direction: "PAYABLE" },
      orderBy: { dueDate: "asc" },
      take: limit,
    });
  }

  return debts.map((d) => ({
    id: d.id,
    title: d.title,
    amount: Number(d.amount),
    dueDate: d.dueDate.toISOString(),
    category: d.category,
  }));
}
