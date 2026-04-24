"use server";

import { prisma } from "@valora/auth/prisma";
import { redirect } from "next/navigation";

import { requireUserId } from "@/lib/session";

import { createDebtSchema } from "../schemas";

export async function createDebt(raw: unknown): Promise<void> {
	const userId = await requireUserId();
	const input = createDebtSchema.parse(raw);

	await prisma.$transaction(async (tx) => {
		let personId = input.personId.trim() || null;

		if (
			input.direction === "RECEIVABLE" &&
			!personId &&
			input.personName.trim()
		) {
			const created = await tx.relatedPerson.create({
				data: { userId, name: input.personName.trim() },
				select: { id: true },
			});
			personId = created.id;
		}

		const dueDate = new Date(input.dueDate);
		const children = (input.children ?? []).filter(
			(c) => c.title.trim().length > 0,
		);

		if (children.length === 0) {
			await tx.debt.create({
				data: {
					userId,
					title: input.title,
					amount: input.amount,
					category: input.category,
					type: input.type,
					recurrence: input.recurrence,
					direction: input.direction,
					personId,
					dueDate,
					notes: input.notes,
					source: "MANUAL",
					status: "OPEN",
				},
			});
			return;
		}

		const parentAmount = children.reduce((sum, c) => sum + c.amount, 0);
		const parent = await tx.debt.create({
			data: {
				userId,
				title: input.title,
				amount: parentAmount,
				category: input.category,
				type: input.type,
				recurrence: input.recurrence,
				direction: input.direction,
				personId,
				dueDate,
				notes: input.notes,
				source: "MANUAL",
				status: "OPEN",
			},
			select: { id: true },
		});

		await tx.debt.createMany({
			data: children.map((child) => ({
				userId,
				parentDebtId: parent.id,
				title: child.title.trim(),
				amount: child.amount,
				category: input.category,
				type: input.type,
				recurrence: input.recurrence,
				direction: input.direction,
				personId: input.direction === "RECEIVABLE" ? personId : null,
				dueDate,
				source: "MANUAL",
				status: "OPEN",
			})),
		});
	});

	redirect("/debts");
}
