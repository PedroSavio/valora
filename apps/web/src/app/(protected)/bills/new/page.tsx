import { BillUploader } from "@/features/bills/components/bill-uploader";

export default function NewBillPage() {
	return (
		<div className="mx-auto w-full max-w-2xl space-y-6 p-6 lg:p-10">
			<header>
				<h1 className="font-semibold text-2xl tracking-tight">Nova fatura</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Envie o PDF da fatura. Extraímos o texto e classificamos os itens com
					IA antes de virarem dívidas.
				</p>
			</header>
			<BillUploader />
		</div>
	);
}
