"use server";

import { auth } from "@valora/auth";
import { prisma } from "@valora/auth/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { updateIncomeSchema } from "../schemas";

export async function updateIncome(raw: unknown): Promise<void> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) throw new Error("unauthorized");

	const input = updateIncomeSchema.parse(raw);

	const updated = await prisma.income.updateMany({
		where: { id: input.id, userId: session.user.id },
		data: {
			type: input.type,
			amount: input.amount,
			taxRate: input.type === "PJ" ? input.taxRate : 0,
			date: new Date(`${input.date}T12:00:00`),
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
