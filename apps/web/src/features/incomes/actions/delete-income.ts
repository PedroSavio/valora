"use server";

import { prisma } from "@valora/auth/prisma";
import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/session";

export async function deleteIncome(id: string): Promise<void> {
	const userId = await requireUserId();

	await prisma.income.deleteMany({
		where: { id, userId },
	});

	revalidatePath("/incomes");
	revalidatePath("/dashboard");
}
