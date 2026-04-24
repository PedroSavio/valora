import { z } from "zod";

export const billItemReviewSchema = z
	.object({
		id: z.string(),
		description: z.string().min(1, "Obrigatório"),
		amount: z.coerce.number().nonnegative(),
		category: z.string().min(1, "Obrigatório"),
		type: z.enum(["FIXED", "VARIABLE"]),
		recurrence: z.enum(["NONE", "MONTHLY", "WEEKLY", "YEARLY"]),
		selected: z.boolean(),
		direction: z.enum(["PAYABLE", "RECEIVABLE"]),
		personId: z.string().optional(),
		personName: z.string().optional(),
		dueDate: z.string().min(1, "Obrigatório"),
	})
	.superRefine((data, ctx) => {
		if (!data.selected || data.direction !== "RECEIVABLE") return;

		const hasPersonId = !!data.personId?.trim();
		const hasPersonName = !!data.personName?.trim();

		if (!hasPersonId && !hasPersonName) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Selecione uma pessoa ou informe um nome para cadastro",
				path: ["personName"],
			});
		}
	});

export const confirmBillSchema = z.object({
	billId: z.string().min(1),
	items: z.array(billItemReviewSchema).min(1),
});

export type BillItemReview = z.infer<typeof billItemReviewSchema>;
export type ConfirmBillInput = z.infer<typeof confirmBillSchema>;
