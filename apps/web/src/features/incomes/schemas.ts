import { z } from "zod";

export const incomeTypeSchema = z.enum(["CLT", "PJ"]);

export const createIncomeSchema = z.object({
	type: incomeTypeSchema,
	amount: z.number().positive("Valor deve ser positivo"),
	taxRate: z.number().min(0, "Não pode ser negativo").max(100, "Máximo 100%"),
	date: z.string().min(1, "Obrigatório"),
	description: z.string().max(500),
});

export const updateIncomeSchema = createIncomeSchema.extend({
	id: z.string().min(1),
});

export const incomeFiltersSchema = z
	.object({
		month: z.coerce.number().int().min(1).max(12).optional(),
		year: z.coerce.number().int().min(2000).max(2100).optional(),
		type: incomeTypeSchema.optional(),
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

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
export type IncomeFilters = z.infer<typeof incomeFiltersSchema>;
