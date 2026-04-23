"use client";

type Props = {
  fromDate: string;
  toDate: string;
};

export function DebtFilters({ fromDate, toDate }: Props) {
  const inputCls =
    "h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 ring-primary/20";

  return (
    <form method="get" className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        De
        <input type="date" name="fromDate" defaultValue={fromDate} className={`${inputCls} min-w-40`} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Até
        <input type="date" name="toDate" defaultValue={toDate} className={`${inputCls} min-w-40`} />
      </label>
      <button
        type="submit"
        className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Aplicar
      </button>
    </form>
  );
}
