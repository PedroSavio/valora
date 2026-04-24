export function startOfMonth(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function previousMonth(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

export function toISODate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

export function parseISODateAtNoon(value: string): Date {
	return new Date(`${value}T12:00:00`);
}

export function rangeFromISODates(fromDate: string, toDate: string) {
	return {
		gte: new Date(`${fromDate}T00:00:00`),
		lte: new Date(`${toDate}T23:59:59.999`),
	};
}
