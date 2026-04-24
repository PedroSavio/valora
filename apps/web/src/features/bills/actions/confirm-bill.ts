"use server";

import { auth } from "@valora/auth";
import { prisma } from "@valora/auth/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { confirmBillSchema } from "../schemas";

export async function confirmBill(raw: unknown): Promise<void> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) throw new Error("unauthorized");

	const input = confirmBillSchema.parse(raw);

	const bill = await prisma.bill.findFirst({
		where: { id: input.billId, userId: session.user.id },
		select: { id: true },
	});
	if (!bill) throw new Error("Fatura não encontrada");

	await prisma.$transaction(async (tx) => {
		const selectedPayables = input.items.filter(
			(i) => i.selected && i.direction === "PAYABLE",
		);
		const billTotal = selectedPayables.reduce((sum, i) => sum + i.amount, 0);
		const billDueDate = selectedPayables[0]?.dueDate ?? input.items[0]?.dueDate;

		let parentDebtId: string | null = null;
		if (selectedPayables.length > 0 && billDueDate) {
			const existingParent = await tx.debt.findFirst({
				where: { billId: bill.id, billItemId: null },
				select: { id: true },
			});

			if (existingParent) {
				await tx.debt.update({
					where: { id: existingParent.id },
					data: {
						title: "Fatura",
						amount: billTotal,
						category: "Fatura",
						type: "VARIABLE",
						recurrence: "MONTHLY",
						direction: "PAYABLE",
						dueDate: new Date(billDueDate),
						status: "OPEN",
					},
				});
				parentDebtId = existingParent.id;
			} else {
				const createdParent = await tx.debt.create({
					data: {
						userId: session.user.id,
						billId: bill.id,
						title: "Fatura",
						amount: billTotal,
						category: "Fatura",
						type: "VARIABLE",
						recurrence: "MONTHLY",
						direction: "PAYABLE",
						dueDate: new Date(billDueDate),
						source: "BILL",
						status: "OPEN",
					},
					select: { id: true },
				});
				parentDebtId = createdParent.id;
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

			if (item.selected) {
				let personId = item.personId?.trim() || null;

				if (
					item.direction === "RECEIVABLE" &&
					!personId &&
					item.personName?.trim()
				) {
					const created = await tx.relatedPerson.create({
						data: {
							userId: session.user.id,
							name: item.personName.trim(),
						},
						select: { id: true },
					});
					personId = created.id;
				}

				await tx.debt.upsert({
					where: { billItemId: item.id },
					create: {
						userId: session.user.id,
						billId: bill.id,
						billItemId: item.id,
						parentDebtId: item.direction === "PAYABLE" ? parentDebtId : null,
						title: item.description,
						amount: item.amount,
						category: item.category,
						type: item.type,
						recurrence: item.recurrence,
						direction: item.direction,
						personId: item.direction === "RECEIVABLE" ? personId : null,
						dueDate: new Date(item.dueDate),
						source: "BILL",
						status: "OPEN",
					},
					update: {
						parentDebtId: item.direction === "PAYABLE" ? parentDebtId : null,
						title: item.description,
						amount: item.amount,
						category: item.category,
						type: item.type,
						recurrence: item.recurrence,
						direction: item.direction,
						personId: item.direction === "RECEIVABLE" ? personId : null,
						dueDate: new Date(item.dueDate),
					},
				});
			} else {
				await tx.debt.deleteMany({ where: { billItemId: item.id } });
			}
		}

		if (!parentDebtId) {
			await tx.debt.deleteMany({
				where: { billId: bill.id, billItemId: null },
			});
		}

		await tx.bill.update({
			where: { id: bill.id },
			data: { status: "CONFIRMED" },
		});
	});

	redirect("/debts");
}
