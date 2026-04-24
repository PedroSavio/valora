"use server";

import { prisma } from "@valora/auth/prisma";
import { redirect } from "next/navigation";

import { requireUserId } from "@/lib/session";

import { confirmBillSchema } from "../schemas";

const PARENT_DEBT_DEFAULTS = {
	title: "Fatura",
	category: "Fatura",
	type: "VARIABLE",
	recurrence: "MONTHLY",
	direction: "PAYABLE",
	status: "OPEN",
} as const;

export async function confirmBill(raw: unknown): Promise<void> {
	const userId = await requireUserId();
	const input = confirmBillSchema.parse(raw);

	const bill = await prisma.bill.findFirst({
		where: { id: input.billId, userId },
		select: { id: true },
	});
	if (!bill) throw new Error("Fatura não encontrada");

	const billId = bill.id;

	await prisma.$transaction(async (tx) => {
		const selectedPayables = input.items.filter(
			(item) => item.selected && item.direction === "PAYABLE",
		);
		const billTotal = selectedPayables.reduce((sum, i) => sum + i.amount, 0);
		const billDueDate = selectedPayables[0]?.dueDate ?? input.items[0]?.dueDate;

		let parentDebtId: string | null = null;
		if (selectedPayables.length > 0 && billDueDate) {
			const parentData = {
				...PARENT_DEBT_DEFAULTS,
				amount: billTotal,
				dueDate: new Date(billDueDate),
			};
			const existingParent = await tx.debt.findFirst({
				where: { billId, billItemId: null },
				select: { id: true },
			});

			if (existingParent) {
				await tx.debt.update({
					where: { id: existingParent.id },
					data: parentData,
				});
				parentDebtId = existingParent.id;
			} else {
				const created = await tx.debt.create({
					data: { ...parentData, userId, billId, source: "BILL" },
					select: { id: true },
				});
				parentDebtId = created.id;
			}
		}

		for (const item of input.items) {
			await tx.billItem.update({
				where: { id: item.id },
				data: {
					description: item.description,
					amount: item.amount,
					category: item.category,
					type: item.type,
					recurrence: item.recurrence,
					selected: item.selected,
				},
			});

			if (!item.selected) {
				await tx.debt.deleteMany({ where: { billItemId: item.id } });
				continue;
			}

			let personId = item.personId?.trim() || null;
			if (
				item.direction === "RECEIVABLE" &&
				!personId &&
				item.personName?.trim()
			) {
				const created = await tx.relatedPerson.create({
					data: { userId, name: item.personName.trim() },
					select: { id: true },
				});
				personId = created.id;
			}

			const linkedParent = item.direction === "PAYABLE" ? parentDebtId : null;
			const linkedPerson = item.direction === "RECEIVABLE" ? personId : null;
			const dueDate = new Date(item.dueDate);

			await tx.debt.upsert({
				where: { billItemId: item.id },
				create: {
					userId,
					billId,
					billItemId: item.id,
					parentDebtId: linkedParent,
					title: item.description,
					amount: item.amount,
					category: item.category,
					type: item.type,
					recurrence: item.recurrence,
					direction: item.direction,
					personId: linkedPerson,
					dueDate,
					source: "BILL",
					status: "OPEN",
				},
				update: {
					parentDebtId: linkedParent,
					title: item.description,
					amount: item.amount,
					category: item.category,
					type: item.type,
					recurrence: item.recurrence,
					direction: item.direction,
					personId: linkedPerson,
					dueDate,
				},
			});
		}

		if (!parentDebtId) {
			await tx.debt.deleteMany({
				where: { billId, billItemId: null },
			});
		}

		await tx.bill.update({
			where: { id: billId },
			data: { status: "CONFIRMED" },
		});
	});

	redirect("/debts");
}
