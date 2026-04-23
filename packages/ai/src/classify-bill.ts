import { generateObject } from "ai";

import { getProviderModel } from "./provider";
import { type ClassifiedBill, classifiedBillSchema } from "./schemas";

const SYSTEM_PROMPT = `You are a financial assistant. You receive a PDF invoice file (credit card bill, payment slip, utility bill) in Portuguese and return a JSON structure with the identified items.

Rules:
- Each purchase/transaction line becomes one item in "items".
- "amount" must be positive in Brazilian reais (convert R$ 1.234,56 to 1234.56).
- "category" should be short and in Portuguese (e.g. "Alimentação", "Transporte", "Serviços", "Moradia", "Saúde", "Lazer", "Educação", "Outros").
- "type": FIXED for recurring monthly expenses (subscriptions, rent), VARIABLE for one-time purchases.
- "recurrence": MONTHLY if a recurring monthly charge is identified, WEEKLY/YEARLY rarely, NONE if it is a one-time charge.
- "totalAmount" is the total invoice amount, if explicitly stated.
- "issuedAt" must be in ISO 8601 format (YYYY-MM-DD) if an issue date is identified; otherwise null.
- Should refund, payment, and interest lines be ignored separately? No — include everything, assigning an appropriate category ("Estorno", "Juros").
- Return nothing other than the requested JSON.
- Do not invent data. If unsure, leave the field as null or empty.`;

type ClassifyBillFileInput = {
  file: Uint8Array | Buffer | ArrayBuffer;
  fileName?: string;
};

export async function classifyBillFile({ file, fileName }: ClassifyBillFileInput): Promise<ClassifiedBill> {
  const model = getProviderModel();
  const { object } = await generateObject({
    model,
    system: SYSTEM_PROMPT,
    schema: classifiedBillSchema,
    schemaName: "classified_bill",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Analise este PDF e extraia os lançamentos da fatura." },
          {
            type: "file",
            data: file,
            mediaType: "application/pdf",
            filename: fileName ?? "fatura.pdf",
          },
        ],
      },
    ],
  });

  return object;
}
