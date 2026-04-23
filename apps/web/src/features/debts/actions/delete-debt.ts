"use server";

import { auth } from "@valora/auth";
import { prisma } from "@valora/auth/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function deleteDebt(debtId: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("unauthorized");

  const deleted = await prisma.debt.deleteMany({
    where: {
      id: debtId,
      userId: session.user.id,
    },
  });

  if (deleted.count === 0) {
    throw new Error("debt_not_found");
  }

  redirect("/debts");
}
