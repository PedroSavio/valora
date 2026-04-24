import { z } from "zod";

export const billItemTypeSchema = z.enum(["FIXED", "VARIABLE"]);
export const recurrenceSchema = z.enum(["NONE", "MONTHLY", "WEEKLY", "YEARLY"]);

export const classifiedItemSchema = z.object({
	description: z.string().min(1),
	amount: z.number().finite(),
	category: z.string().min(1),
	type: billItemTypeSchema,
	recurrence: recurrenceSchema,
});

export const classifiedBillSchema = z.object({
	totalAmount: z.number().nonnegative().optional(),
	issuedAt: z.string().nullable().optional(),
	items: z.array(classifiedItemSchema),
});

export type ClassifiedItem = z.infer<typeof classifiedItemSchema>;
export type ClassifiedBill = z.infer<typeof classifiedBillSchema>;
