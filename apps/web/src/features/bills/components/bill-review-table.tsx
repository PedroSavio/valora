"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { formatBRL } from "@/lib/format";

import { confirmBill } from "../actions/confirm-bill";
import type { BillItemReview } from "../schemas";

const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Serviços",
  "Moradia",
  "Saúde",
  "Lazer",
  "Educação",
  "Cartão",
  "Outros",
];

type Props = {
  billId: string;
  initialItems: BillItemReview[];
  defaultDueDate: string;
  relatedPeople: { id: string; name: string }[];
};

export function BillReviewTable({ billId, initialItems, defaultDueDate, relatedPeople }: Props) {
  const [items, setItems] = useState<BillItemReview[]>(
    initialItems.map((i) => ({ ...i, dueDate: i.dueDate || defaultDueDate })),
  );
  const [applyDirection, setApplyDirection] = useState<BillItemReview["direction"]>("PAYABLE");
  const [applyPersonId, setApplyPersonId] = useState("");
  const [applyPersonName, setApplyPersonName] = useState("");
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof BillItemReview>(id: string, key: K, value: BillItemReview[K]) {
    setItems((curr) => curr.map((i) => (i.id === id ? { ...i, [key]: value } : i)));
  }

  const selectedCount = items.filter((i) => i.selected).length;
  const selectedTotal = items.filter((i) => i.selected).reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-[18px] border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Aplicar para todos os itens:
        </p>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Responsável
          <select
            value={applyDirection}
            onChange={(e) => setApplyDirection(e.target.value as BillItemReview["direction"])}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none ring-primary/20 focus:ring-2"
          >
            <option value="PAYABLE">Minha</option>
            <option value="RECEIVABLE">Outra pessoa</option>
          </select>
        </label>
        {applyDirection === "RECEIVABLE" ? (
          <>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Pessoa existente
              <select
                value={applyPersonId}
                onChange={(e) => setApplyPersonId(e.target.value)}
                className="h-10 min-w-44 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none ring-primary/20 focus:ring-2"
              >
                <option value="">Selecionar</option>
                {relatedPeople.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Ou nome
              <input
                value={applyPersonName}
                onChange={(e) => setApplyPersonName(e.target.value)}
                placeholder="Nome da pessoa"
                className="h-10 min-w-48 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none ring-primary/20 focus:ring-2"
              />
            </label>
          </>
        ) : null}
        <button
          type="button"
          onClick={() =>
            setItems((curr) =>
              curr.map((i) => ({
                ...i,
                direction: applyDirection,
                personId: applyDirection === "RECEIVABLE" ? applyPersonId : "",
                personName: applyDirection === "RECEIVABLE" ? applyPersonName : "",
              })),
            )
          }
          className="h-10 rounded-md border border-border px-4 text-sm font-medium hover:bg-card/70"
        >
          Aplicar para todos
        </button>
      </div>
      <div className="overflow-hidden rounded-[18px] border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-black/20 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-3 text-left">Dívida</th>
              <th className="px-3 py-3 text-left">Descrição</th>
              <th className="px-3 py-3 text-right">Valor</th>
              <th className="px-3 py-3 text-left">Categoria</th>
              <th className="px-3 py-3 text-left">Tipo</th>
              <th className="px-3 py-3 text-left">Recorrência</th>
              <th className="px-3 py-3 text-left">Responsável</th>
              <th className="px-3 py-3 text-left">Pessoa</th>
              <th className="px-3 py-3 text-left">Vencimento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={(e) => update(item.id, "selected", e.target.checked)}
                    className="size-4 accent-primary"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={item.description}
                    onChange={(e) => update(item.id, "description", e.target.value)}
                    className="w-full rounded-md bg-transparent px-2 py-1 text-sm outline-none hover:bg-black/20 focus:bg-black/30"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) => update(item.id, "amount", Number(e.target.value))}
                    className="w-28 rounded-md bg-transparent px-2 py-1 text-right text-sm outline-none hover:bg-black/20 focus:bg-black/30"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={CATEGORIES.includes(item.category) ? item.category : "Outros"}
                    onChange={(e) => update(item.id, "category", e.target.value)}
                    className="rounded-md bg-transparent px-2 py-1 text-sm outline-none hover:bg-black/20"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-card">
                        {c}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <select
                    value={item.type}
                    onChange={(e) =>
                      update(item.id, "type", e.target.value as BillItemReview["type"])
                    }
                    className="rounded-md bg-transparent px-2 py-1 text-sm outline-none hover:bg-black/20"
                  >
                    <option value="VARIABLE" className="bg-card">Variável</option>
                    <option value="FIXED" className="bg-card">Fixa</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <select
                    value={item.recurrence}
                    onChange={(e) =>
                      update(item.id, "recurrence", e.target.value as BillItemReview["recurrence"])
                    }
                    className="rounded-md bg-transparent px-2 py-1 text-sm outline-none hover:bg-black/20"
                  >
                    <option value="NONE" className="bg-card">Pontual</option>
                    <option value="MONTHLY" className="bg-card">Mensal</option>
                    <option value="WEEKLY" className="bg-card">Semanal</option>
                    <option value="YEARLY" className="bg-card">Anual</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <select
                    value={item.direction}
                    onChange={(e) =>
                      update(item.id, "direction", e.target.value as BillItemReview["direction"])
                    }
                    className="rounded-md bg-transparent px-2 py-1 text-sm outline-none hover:bg-black/20"
                  >
                    <option value="PAYABLE" className="bg-card">Minha</option>
                    <option value="RECEIVABLE" className="bg-card">Outra pessoa</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  {item.direction === "RECEIVABLE" ? (
                    <div className="flex min-w-56 flex-col gap-1">
                      <select
                        value={item.personId ?? ""}
                        onChange={(e) => update(item.id, "personId", e.target.value)}
                        className="rounded-md bg-transparent px-2 py-1 text-sm outline-none hover:bg-black/20"
                      >
                        <option value="" className="bg-card">Pessoa existente</option>
                        {relatedPeople.map((p) => (
                          <option key={p.id} value={p.id} className="bg-card">
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        value={item.personName ?? ""}
                        onChange={(e) => update(item.id, "personName", e.target.value)}
                        placeholder="Ou digite o nome"
                        className="rounded-md bg-transparent px-2 py-1 text-sm outline-none hover:bg-black/20 focus:bg-black/30"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <input
                    type="date"
                    value={item.dueDate.slice(0, 10)}
                    onChange={(e) => update(item.id, "dueDate", e.target.value)}
                    className="rounded-md bg-transparent px-2 py-1 text-sm outline-none hover:bg-black/20"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          {selectedCount} item(s) selecionado(s) ·{" "}
          <span className="font-semibold text-foreground">{formatBRL(selectedTotal)}</span>
        </p>
        <button
          type="button"
          disabled={isPending || selectedCount === 0}
          onClick={() =>
            startTransition(async () => {
              try {
                await confirmBill({ billId, items });
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Falha ao confirmar");
              }
            })
          }
          className="rounded-[18px] bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Confirmando..." : "Confirmar e criar dívidas"}
        </button>
      </div>
    </div>
  );
}
