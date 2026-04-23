"use client";

import { UploadCloud } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { uploadBill } from "../actions/upload-bill";

export function BillUploader() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        startTransition(async () => {
          try {
            await uploadBill(fd);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Falha no upload");
          }
        });
      }}
      className="space-y-4"
    >
      <label
        htmlFor="bill-file"
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-border bg-card p-10 text-center transition-colors hover:border-primary/60"
      >
        <UploadCloud className="size-8 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-foreground">
            {fileName ?? "Clique para selecionar o PDF da fatura"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">PDF até 10MB</p>
        </div>
        <input
          id="bill-file"
          name="file"
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </label>
      <button
        type="submit"
        disabled={!fileName || isPending}
        className="flex w-full items-center justify-center rounded-[18px] bg-primary px-4 py-[22px] text-base font-semibold text-primary-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Processando PDF..." : "Enviar e analisar"}
      </button>
    </form>
  );
}
