import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { formatBRL } from "@/lib/format";

import type { KpiDelta } from "../types";

type Tone = "neutral" | "positive" | "negative" | "primary";

type Props = {
	label: string;
	value: number;
	delta?: KpiDelta;
	tone?: Tone;
	hint?: string;
};

const toneStyles: Record<Tone, string> = {
	neutral: "bg-card border-border",
	positive: "bg-card border-border",
	negative: "bg-card border-border",
	primary: "bg-primary text-primary-foreground border-transparent",
};

export function KpiCard({
	label,
	value,
	delta,
	tone = "neutral",
	hint,
}: Props) {
	const mutedClass =
		tone === "primary" ? "text-primary-foreground/70" : "text-muted-foreground";
	return (
		<div className={`rounded-[22px] border p-7 lg:p-8 ${toneStyles[tone]}`}>
			<div className="flex items-start justify-between">
				<span className={`text-base ${mutedClass}`}>{label}</span>
				{delta ? <DeltaBadge delta={delta} tone={tone} /> : null}
			</div>
			<div className="mt-5 overflow-x-auto whitespace-nowrap font-semibold text-[clamp(1.35rem,3vw,2.25rem)] leading-tight tracking-tight [scrollbar-width:none]">
				{formatBRL(value)}
			</div>
			{hint ? <p className={`mt-3 text-sm ${mutedClass}`}>{hint}</p> : null}
		</div>
	);
}

function DeltaBadge({ delta, tone }: { delta: KpiDelta; tone: Tone }) {
	const Icon =
		delta.direction === "up"
			? ArrowUpRight
			: delta.direction === "down"
				? ArrowDownRight
				: Minus;
	const bg =
		tone === "primary"
			? "bg-primary-foreground/10 text-primary-foreground"
			: delta.direction === "up"
				? "bg-primary/15 text-primary"
				: "bg-destructive/15 text-destructive";
	return (
		<span
			className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${bg}`}
		>
			<Icon className="size-3.5" />
			{delta.percent.toFixed(1)}%
		</span>
	);
}
