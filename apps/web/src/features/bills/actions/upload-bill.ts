"use server";

import { classifyBillFile } from "@valora/ai";
import { auth } from "@valora/auth";
import { prisma } from "@valora/auth/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const MAX_SIZE = 10 * 1024 * 1024;

export async function uploadBill(formData: FormData): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("unauthorized");

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Arquivo inválido");
  if (file.size === 0 || file.size > MAX_SIZE) throw new Error("PDF fora do limite (10MB)");
  if (file.type !== "application/pdf") throw new Error("Apenas PDF");

  const buffer = Buffer.from(await file.arrayBuffer());
  const classified = await classifyBillFile({ file: buffer, fileName: file.name });
  const normalizedItems = classified.items.map((item) => ({
    ...item,
    amount: Math.abs(item.amount),
  }));

  const bill = await prisma.bill.create({
    data: {
      userId: session.user.id,
      fileName: file.name,
      rawText: "",
      status: "DRAFT",
      totalAmount: classified.totalAmount ?? 0,
      issuedAt: classified.issuedAt ? new Date(classified.issuedAt) : null,
      items: {
        create: normalizedItems.map((item) => ({
          description: item.description,
          amount: item.amount,
          category: item.category,
          type: item.type,
          recurrence: item.recurrence,
          selected: true,
        })),
      },
    },
    select: { id: true },
  });

  redirect(`/bills/${bill.id}/review`);
}
