"use client";

type Props = {
	fromDate: string;
	toDate: string;
};

export function DebtFilters({ fromDate, toDate }: Props) {
	const inputCls =
		"h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 ring-primary/20";

	return (
		<form
			method="get"
			className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end"
		>
			<label className="flex flex-col gap-1 text-muted-foreground text-xs">
				De
				<input
					type="date"
					name="fromDate"
					defaultValue={fromDate}
					className={`${inputCls} w-full sm:min-w-40`}
				/>
			</label>
			<label className="flex flex-col gap-1 text-muted-foreground text-xs">
				Até
				<input
					type="date"
					name="toDate"
					defaultValue={toDate}
					className={`${inputCls} w-full sm:min-w-40`}
				/>
			</label>
			<button
				type="submit"
				className="col-span-2 h-10 rounded-md bg-primary px-4 font-medium text-primary-foreground text-sm hover:opacity-90 sm:col-span-1"
			>
				Aplicar
			</button>
		</form>
	);
}
