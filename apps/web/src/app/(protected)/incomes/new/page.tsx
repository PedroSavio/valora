import { IncomeForm } from "@/features/incomes/components/income-form";

export default function NewIncomePage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-6 lg:p-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Nova entrada</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registre um recebimento CLT ou PJ para refletir automaticamente no dashboard.
        </p>
      </header>
      <IncomeForm />
    </div>
  );
}
