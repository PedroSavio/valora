"use server";

import { prisma } from "@valora/auth/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseISODateAtNoon } from "@/lib/date";
import { requireUserId } from "@/lib/session";

import { createIncomeSchema } from "../schemas";

export async function createIncome(raw: unknown): Promise<void> {
	const userId = await requireUserId();
	const input = createIncomeSchema.parse(raw);

	await prisma.income.create({
		data: {
			userId,
			type: input.type,
			amount: input.amount,
			taxRate: input.type === "PJ" ? input.taxRate : 0,
			date: parseISODateAtNoon(input.date),
			description: input.description.trim() || null,
		},
	});

	revalidatePath("/incomes");
	revalidatePath("/dashboard");
	redirect("/incomes");
}
