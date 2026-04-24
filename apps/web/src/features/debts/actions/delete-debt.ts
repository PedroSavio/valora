"use server";

import { prisma } from "@valora/auth/prisma";
import { redirect } from "next/navigation";

import { requireUserId } from "@/lib/session";

export async function deleteDebt(debtId: string): Promise<void> {
	const userId = await requireUserId();

	const deleted = await prisma.$transaction(async (tx) => {
		const target = await tx.debt.findFirst({
			where: { id: debtId, userId },
			select: { id: true },
		});
		if (!target) return 0;

		await tx.debt.deleteMany({
			where: { parentDebtId: target.id, userId },
		});
		const root = await tx.debt.deleteMany({
			where: { id: target.id, userId },
		});
		return root.count;
	});

	if (deleted === 0) {
		throw new Error("debt_not_found");
	}

	redirect("/debts");
}
