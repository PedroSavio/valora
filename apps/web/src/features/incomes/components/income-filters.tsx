"use client";

type Props = {
  fromDate: string;
  toDate: string;
  selectedType?: "CLT" | "PJ";
};

export function IncomeFilters({ fromDate, toDate, selectedType }: Props) {
  const selectCls =
    "h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 ring-primary/20";

  return (
    <form method="get" className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        De
        <input type="date" name="fromDate" defaultValue={fromDate} className={`${selectCls} min-w-40`} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Até
        <input type="date" name="toDate" defaultValue={toDate} className={`${selectCls} min-w-40`} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Tipo
        <select name="type" defaultValue={selectedType ?? ""} className={`${selectCls} min-w-28`}>
          <option value="">Todos</option>
          <option value="CLT">CLT</option>
          <option value="PJ">PJ</option>
        </select>
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
