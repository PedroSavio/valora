import { auth } from "@valora/auth";
import { prisma } from "@valora/auth/prisma";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { BillReviewTable } from "@/features/bills/components/bill-review-table";
import type { BillItemReview } from "@/features/bills/schemas";
import { listRelatedPeople } from "@/features/debts/data/related-people.repo";

export default async function BillReviewPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) redirect("/login");

	const [bill, relatedPeople] = await Promise.all([
		prisma.bill.findFirst({
			where: { id, userId: session.user.id },
			include: { items: true },
		}),
		listRelatedPeople(session.user.id),
	]);
	if (!bill) notFound();

	const defaultDueDate = (bill.issuedAt ?? new Date())
		.toISOString()
		.slice(0, 10);

	const initialItems: BillItemReview[] = bill.items.map((i) => ({
		id: i.id,
		description: i.description,
		amount: Number(i.amount),
		category: i.category,
		type: i.type,
		recurrence: i.recurrence,
		selected: i.selected,
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
