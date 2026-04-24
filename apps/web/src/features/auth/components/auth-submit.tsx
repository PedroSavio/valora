import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "primary" | "outline";
	children: ReactNode;
};

export function AuthSubmit({
	variant = "primary",
	className = "",
	children,
	...rest
}: Props) {
	const base =
		"flex w-full items-center justify-center gap-3 rounded-[18px] px-4 py-[22px] text-base font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
	const styles =
		variant === "primary"
			? "bg-primary text-primary-foreground hover:bg-primary/90"
			: "border border-border bg-card text-foreground hover:bg-card/70";
	return (
		<button {...rest} className={`${base} ${styles} ${className}`}>
			{children}
		</button>
	);
}
