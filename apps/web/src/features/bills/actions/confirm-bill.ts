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

        if (item.direction === "RECEIVABLE" && !personId && item.personName?.trim()) {
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

    await tx.bill.update({
      where: { id: bill.id },
      data: { status: "CONFIRMED" },
    });
  });

  redirect("/debts");
}
