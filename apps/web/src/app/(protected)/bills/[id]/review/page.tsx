import { prisma } from "@valora/auth/prisma";
import { notFound } from "next/navigation";

import { BillReviewTable } from "@/features/bills/components/bill-review-table";
import type { BillItemReview } from "@/features/bills/schemas";
import { listRelatedPeople } from "@/features/debts/data/related-people.repo";
import { toISODate } from "@/lib/date";
import { requireSession } from "@/lib/session";

export default async function BillReviewPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const session = await requireSession();

	const [bill, relatedPeople] = await Promise.all([
		prisma.bill.findFirst({
			where: { id, userId: session.user.id },
			include: { items: true },
		}),
		listRelatedPeople(session.user.id),
	]);
	if (!bill) notFound();

	const defaultDueDate = toISODate(bill.issuedAt ?? new Date());

	const initialItems: BillItemReview[] = bill.items.map((item) => ({
		id: item.id,
		description: item.description,
		amount: Number(item.amount),
		category: item.category,
		type: item.type,
		recurrence: item.recurrence,
		selected: item.selected,
		direction: "PAYABLE",
		personId: "",
		personName: "",
		dueDate: defaultDueDate,
	}));

	return (
		<div className="mx-auto w-full max-w-[1100px] space-y-6 p-6 lg:p-10">
			<header>
				<h1 className="font-semibold text-2xl tracking-tight">
					Revisar fatura
				</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					{bill.fileName} · {bill.items.length} item(s) identificado(s). Ajuste
					o que for necessário e escolha quais viram dívidas.
				</p>
			</header>
			<BillReviewTable
				billId={bill.id}
				initialItems={initialItems}
				defaultDueDate={defaultDueDate}
				relatedPeople={relatedPeople}
			/>
		</div>
	);
}
