import { Users } from "lucide-react";

import { formatBRL } from "@/lib/format";

import type { OwingPerson } from "../types";

export function PeopleOwing({ people }: { people: OwingPerson[] }) {
  return (
    <section className="h-full rounded-[22px] border border-border bg-card p-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Pessoas que te devem</h2>
          <p className="text-sm text-muted-foreground">Valores em aberto</p>
        </div>
        <Users className="size-5 text-muted-foreground" />
      </header>
      {people.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum valor a receber no momento.</p>
      ) : (
        <ul className="divide-y divide-border">
          {people.map((person) => (
            <li
              key={person.personId ?? `unknown-${person.name}`}
              className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{person.name}</p>
                <p className="text-sm text-muted-foreground">
                  {person.debtCount} {person.debtCount === 1 ? "registro" : "registros"}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold sm:text-base">
                Total: {formatBRL(person.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
