import { WalletCards } from "lucide-react";

import { formatBRL } from "@/lib/format";

type Props = {
  totalReceivable: number;
  projectedBalance: number;
  peopleCount: number;
  entriesCount: number;
};

export function ReceivablesSummary({
  totalReceivable,
  projectedBalance,
  peopleCount,
  entriesCount,
}: Props) {
  return (
    <section className="h-full rounded-[22px] border border-border bg-card p-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Resumo dos recebíveis</h2>
          <p className="text-sm text-muted-foreground">Panorama geral</p>
        </div>
        <WalletCards className="size-5 text-muted-foreground" />
      </header>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Total a receber</span>
          <span className="font-semibold">{formatBRL(totalReceivable)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Saldo projetado</span>
          <span className="font-semibold">{formatBRL(projectedBalance)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Pessoas devendo</span>
          <span className="font-semibold">{peopleCount}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Registros em aberto</span>
          <span className="font-semibold">{entriesCount}</span>
        </div>
      </div>
    </section>
  );
}
