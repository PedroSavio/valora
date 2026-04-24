"use server";

import { prisma } from "@valora/auth/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseISODateAtNoon } from "@/lib/date";
import { requireUserId } from "@/lib/session";

import { updateIncomeSchema } from "../schemas";

export async function updateIncome(raw: unknown): Promise<void> {
	const userId = await requireUserId();
	const input = updateIncomeSchema.parse(raw);

	const updated = await prisma.income.updateMany({
		where: { id: input.id, userId },
		data: {
			type: input.type,
			amount: input.amount,
			taxRate: input.type === "PJ" ? input.taxRate : 0,
			date: parseISODateAtNoon(input.date),
			description: input.description.trim() || null,
		},
	});

	if (updated.count === 0) {
		throw new Error("income_not_found");
	}

	revalidatePath("/incomes");
	revalidatePath("/dashboard");
	redirect("/incomes");
}
