import type { ReactNode } from "react";

export const formInputClass =
	"w-full rounded-[14px] border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary/60";

type FormFieldProps = {
	label: string;
	error?: string;
	className?: string;
	children: ReactNode;
};

export function FormField({
	label,
	error,
	className,
	children,
}: FormFieldProps) {
	return (
		<div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
			<span className="font-medium text-muted-foreground text-xs">{label}</span>
			{children}
			{error ? <span className="text-destructive text-xs">{error}</span> : null}
		</div>
	);
}
