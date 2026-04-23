"use server";

import { auth } from "@valora/auth";
import { prisma } from "@valora/auth/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { updateDebtSchema } from "../schemas";

export async function updateDebt(raw: unknown): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("unauthorized");

  const input = updateDebtSchema.parse(raw);

  await prisma.$transaction(async (tx) => {
    const target = await tx.debt.findFirst({
      where: { id: input.id, userId: session.user.id },
      select: { id: true },
    });
    if (!target) throw new Error("debt_not_found");

    let personId = input.personId?.trim() || null;

    if (input.direction === "RECEIVABLE" && !personId && input.personName?.trim()) {
      const created = await tx.relatedPerson.create({
        data: {
          userId: session.user.id,
          name: input.personName.trim(),
        },
        select: { id: true },
      });
      personId = created.id;
    }

    const children = (input.children ?? []).filter((c) => c.title.trim().length > 0);
    const nextAmount =
      children.length > 0 ? children.reduce((sum, c) => sum + c.amount, 0) : input.amount;

    await tx.debt.update({
      where: { id: target.id },
      data: {
        title: input.title,
        amount: nextAmount,
        category: input.category,
        type: input.type,
        recurrence: input.recurrence,
        direction: input.direction,
        personId: input.direction === "RECEIVABLE" ? personId : null,
        dueDate: new Date(input.dueDate),
        notes: input.notes,
      },
    });

    const existingChildren = await tx.debt.findMany({
      where: { parentDebtId: target.id, userId: session.user.id },
      select: { id: true },
    });
    const existingIds = new Set(existingChildren.map((c) => c.id));
    const submittedIds = new Set(
      children.map((c) => c.id).filter((id): id is string => Boolean(id)),
    );

    for (const child of children) {
      if (child.id && existingIds.has(child.id)) {
        await tx.debt.update({
          where: { id: child.id },
          data: {
            title: child.title.trim(),
            amount: child.amount,
            category: input.category,
            type: input.type,
            recurrence: input.recurrence,
            direction: input.direction,
            personId: input.direction === "RECEIVABLE" ? personId : null,
            dueDate: new Date(input.dueDate),
          },
        });
      } else {
        await tx.debt.create({
          data: {
            userId: session.user.id,
            parentDebtId: target.id,
            title: child.title.trim(),
            amount: child.amount,
            category: input.category,
            type: input.type,
            recurrence: input.recurrence,
            direction: input.direction,
            personId: input.direction === "RECEIVABLE" ? personId : null,
            dueDate: new Date(input.dueDate),
            source: "MANUAL",
            status: "OPEN",
          },
        });
      }
    }

    const removeIds = existingChildren
      .map((c) => c.id)
      .filter((id) => !submittedIds.has(id));
    if (removeIds.length > 0) {
      await tx.debt.deleteMany({
        where: { id: { in: removeIds }, userId: session.user.id },
      });
    }
  });

  redirect("/debts");
}
