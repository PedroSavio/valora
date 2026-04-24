"use server";

import { prisma } from "@valora/auth/prisma";
import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/session";

export async function settleDebt(debtId: string): Promise<void> {
	const userId = await requireUserId();

	const debt = await prisma.debt.findFirst({
		where: { id: debtId, userId },
		select: { id: true, status: true },
	});
	if (!debt) throw new Error("debt_not_found");

	const nextStatus = debt.status === "PAID" ? "OPEN" : "PAID";
	const nextPaidAt = nextStatus === "PAID" ? new Date() : null;

	await prisma.$transaction(async (tx) => {
		await tx.debt.update({
			where: { id: debt.id },
			data: { status: nextStatus, paidAt: nextPaidAt },
		});

		await tx.debt.updateMany({
			where: { parentDebtId: debt.id },
			data: { status: nextStatus, paidAt: nextPaidAt },
		});
	});

	revalidatePath("/debts");
	revalidatePath("/dashboard");
}
