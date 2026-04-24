import { z } from "zod";

export const debtChildSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(2, "Mínimo 2 caracteres"),
	amount: z.number().positive("Valor deve ser positivo"),
});

export const createDebtSchema = z
	.object({
		title: z.string().min(2, "Mínimo 2 caracteres"),
		amount: z.number().positive("Valor deve ser positivo"),
		category: z.string().min(1, "Obrigatório"),
		type: z.enum(["FIXED", "VARIABLE"]),
		recurrence: z.enum(["NONE", "MONTHLY", "WEEKLY", "YEARLY"]),
		direction: z.enum(["PAYABLE", "RECEIVABLE"]),
		personId: z.string(),
		personName: z.string(),
		children: z.array(debtChildSchema).optional(),
		dueDate: z.string().min(1, "Obrigatório"),
		notes: z.string(),
	})
	.superRefine((data, ctx) => {
		if (data.direction !== "RECEIVABLE") return;

		const hasPersonId = !!data.personId.trim();
		const hasPersonName = !!data.personName.trim();

		if (!hasPersonId && !hasPersonName) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Selecione uma pessoa ou informe um nome para cadastro",
				path: ["personName"],
			});
		}
	});

export const updateDebtSchema = createDebtSchema.extend({
	id: z.string().min(1),
});

export const debtFiltersSchema = z
	.object({
		fromDate: z.string().optional(),
		toDate: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (!data.fromDate || !data.toDate) return;
		if (data.toDate < data.fromDate) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Data final deve ser maior ou igual à data inicial",
				path: ["toDate"],
			});
		}
	});

export type CreateDebtInput = z.infer<typeof createDebtSchema>;
export type UpdateDebtInput = z.infer<typeof updateDebtSchema>;
export type DebtFilters = z.infer<typeof debtFiltersSchema>;
