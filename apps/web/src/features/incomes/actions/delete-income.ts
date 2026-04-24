"use server";

import { auth } from "@valora/auth";
import { prisma } from "@valora/auth/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function deleteIncome(id: string): Promise<void> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) throw new Error("unauthorized");

	await prisma.income.deleteMany({
		where: { id, userId: session.user.id },
	});

	revalidatePath("/incomes");
	revalidatePath("/dashboard");
}
