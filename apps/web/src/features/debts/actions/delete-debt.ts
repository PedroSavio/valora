"use server";

import { auth } from "@valora/auth";
import { prisma } from "@valora/auth/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function deleteDebt(debtId: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("unauthorized");

  const deleted = await prisma.$transaction(async (tx) => {
    const target = await tx.debt.findFirst({
      where: { id: debtId, userId: session.user.id },
      select: { id: true },
    });
    if (!target) return 0;

    await tx.debt.deleteMany({ where: { parentDebtId: target.id, userId: session.user.id } });
    const root = await tx.debt.deleteMany({ where: { id: target.id, userId: session.user.id } });
    return root.count;
  });

  if (deleted === 0) {
    throw new Error("debt_not_found");
  }

  redirect("/debts");
}
