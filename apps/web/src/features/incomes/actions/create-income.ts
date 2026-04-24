"use server";

import { auth } from "@valora/auth";
import { prisma } from "@valora/auth/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createIncomeSchema } from "../schemas";

export async function createIncome(raw: unknown): Promise<void> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) throw new Error("unauthorized");

	const input = createIncomeSchema.parse(raw);

	await prisma.income.create({
		data: {
			userId: session.user.id,
			type: input.type,
			amount: input.amount,
			taxRate: input.type === "PJ" ? input.taxRate : 0,
			date: new Date(`${input.date}T12:00:00`),
			description: input.description.trim() || null,
		},
	});

	revalidatePath("/incomes");
	revalidatePath("/dashboard");
	redirect("/incomes");
}
