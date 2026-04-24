"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { signUpSchema } from "../schemas";
import { AuthField } from "./auth-field";
import { AuthSubmit } from "./auth-submit";

export function SignUpForm() {
	const router = useRouter();

	const form = useForm({
		defaultValues: { name: "", email: "", password: "" },
		validators: { onSubmit: signUpSchema },
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{ name: value.name, email: value.email, password: value.password },
				{
					onSuccess: () => {
						toast.success("Conta criada");
						router.push("/dashboard");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<form.Field name="name">
				{(field) => (
					<AuthField
						label="Nome"
						placeholder="Como devemos te chamar"
						autoComplete="name"
						value={field.state.value}
						onChange={field.handleChange}
						onBlur={field.handleBlur}
						error={field.state.meta.errors[0]?.message}
					/>
				)}
			</form.Field>

			<form.Field name="email">
				{(field) => (
					<AuthField
						label="Endereço de email"
						placeholder="Digite seu email"
						type="email"
						autoComplete="email"
						value={field.state.value}
						onChange={field.handleChange}
						onBlur={field.handleBlur}
						error={field.state.meta.errors[0]?.message}
					/>
				)}
			</form.Field>

			<form.Field name="password">
				{(field) => (
					<AuthField
						label="Senha"
						placeholder="Mínimo 8 caracteres"
						type="password"
						autoComplete="new-password"
						value={field.state.value}
						onChange={field.handleChange}
						onBlur={field.handleBlur}
						error={field.state.meta.errors[0]?.message}
					/>
				)}
			</form.Field>

			<div className="pt-3">
				<form.Subscribe
					selector={(s) => ({
						canSubmit: s.canSubmit,
						isSubmitting: s.isSubmitting,
					})}
				>
					{({ canSubmit, isSubmitting }) => (
						<AuthSubmit type="submit" disabled={!canSubmit || isSubmitting}>
							{isSubmitting ? "Criando..." : "Criar conta"}
						</AuthSubmit>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
