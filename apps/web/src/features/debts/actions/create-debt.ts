"use server";

import { auth } from "@valora/auth";
import { prisma } from "@valora/auth/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createDebtSchema } from "../schemas";

export async function createDebt(raw: unknown): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("unauthorized");

  const input = createDebtSchema.parse(raw);

  await prisma.$transaction(async (tx) => {
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

    await tx.debt.create({
      data: {
        userId: session.user.id,
        title: input.title,
        amount: input.amount,
        category: input.category,
        type: input.type,
        recurrence: input.recurrence,
        direction: input.direction,
        personId,
        dueDate: new Date(input.dueDate),
        notes: input.notes,
        source: "MANUAL",
        status: "OPEN",
      },
    });
  });

  redirect("/debts");
}
