export const EXPENSE_CATEGORIES = [
	"Alimentação",
	"Transporte",
	"Serviços",
	"Moradia",
	"Saúde",
	"Lazer",
	"Educação",
	"Cartão",
	"Outros",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
