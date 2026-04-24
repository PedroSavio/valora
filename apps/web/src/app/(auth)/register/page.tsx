import Link from "next/link";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export default function RegisterPage() {
	return (
		<AuthShell
			title="Criar sua conta"
			subtitle="Comece a organizar suas finanças em minutos."
			footer={
				<span className="text-muted-foreground">
					Já tem conta?{" "}
					<Link
						href="/login"
						className="font-medium text-primary hover:underline"
					>
						Entrar
					</Link>
				</span>
			}
		>
			<SignUpForm />
		</AuthShell>
	);
}
