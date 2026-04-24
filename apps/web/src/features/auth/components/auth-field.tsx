"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

type AuthFieldProps = {
	label: string;
	placeholder?: string;
	type?: "text" | "email" | "password";
	value: string;
	onChange: (v: string) => void;
	onBlur?: () => void;
	error?: string;
	autoComplete?: string;
};

export function AuthField({
	label,
	placeholder,
	type = "text",
	value,
	onChange,
	onBlur,
	error,
	autoComplete,
}: AuthFieldProps) {
	const id = useId();
	const [show, setShow] = useState(false);
	const isPassword = type === "password";
	const resolvedType = isPassword ? (show ? "text" : "password") : type;

	return (
		<div className="space-y-1.5">
			<div
				className={`flex items-center justify-between rounded-[18px] border bg-card px-3.5 py-4 transition-colors focus-within:border-primary/60 ${
					error ? "border-destructive" : "border-border"
				}`}
			>
				<div className="flex flex-1 flex-col gap-1">
					<label htmlFor={id} className="font-normal text-foreground text-sm">
						{label}
					</label>
					<input
						id={id}
						type={resolvedType}
						value={value}
						onChange={(e) => onChange(e.target.value)}
						onBlur={onBlur}
						placeholder={placeholder}
						autoComplete={autoComplete}
						className="w-full bg-transparent font-light text-muted-foreground text-sm outline-none placeholder:text-muted-foreground"
					/>
				</div>
				{isPassword ? (
					<button
						type="button"
						onClick={() => setShow((s) => !s)}
						aria-label={show ? "Ocultar senha" : "Mostrar senha"}
						className="ml-3 text-muted-foreground transition-colors hover:text-foreground"
					>
						{show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
					</button>
				) : null}
			</div>
			{error ? <p className="px-1 text-destructive text-xs">{error}</p> : null}
		</div>
	);
}
