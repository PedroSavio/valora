"use server";

import { classifyBillFile } from "@valora/ai";
import { prisma } from "@valora/auth/prisma";
import { redirect } from "next/navigation";

import { requireUserId } from "@/lib/session";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_MIME_TYPE = "application/pdf";

export async function uploadBill(formData: FormData): Promise<void> {
	const userId = await requireUserId();

	const file = formData.get("file");
	if (!(file instanceof File)) throw new Error("Arquivo inválido");
	if (file.size === 0 || file.size > MAX_SIZE_BYTES)
		throw new Error("PDF fora do limite (10MB)");
	if (file.type !== ACCEPTED_MIME_TYPE) throw new Error("Apenas PDF");

	const buffer = Buffer.from(await file.arrayBuffer());
	const classified = await classifyBillFile({
		file: buffer,
		fileName: file.name,
	});

	const bill = await prisma.bill.create({
		data: {
			userId,
			fileName: file.name,
			rawText: "",
			status: "DRAFT",
			totalAmount: classified.totalAmount ?? 0,
			issuedAt: classified.issuedAt ? new Date(classified.issuedAt) : null,
			items: {
				create: classified.items.map((item) => ({
					description: item.description,
					amount: Math.abs(item.amount),
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
