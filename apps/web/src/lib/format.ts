const brlFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "short",
});

export function formatBRL(value: number): string {
	return brlFormatter.format(value);
}

function parseDateInput(value: string | Date): Date | null {
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : value;
	}

	const trimmed = value.trim();
	if (!trimmed) return null;

	const normalized = trimmed.includes("T") ? trimmed : `${trimmed}T12:00:00`;
	const parsed = new Date(normalized);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatShortDate(value: string | Date): string {
	const date = parseDateInput(value);
	if (!date) return "--";
	return shortDateFormatter.format(date);
}

export function monthLabel(date = new Date()): string {
	return new Intl.DateTimeFormat("pt-BR", {
		month: "long",
		year: "numeric",
	}).format(date);
}
