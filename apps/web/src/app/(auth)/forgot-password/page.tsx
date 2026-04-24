import Link from "next/link";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
	return (
		<AuthShell
			title="Esqueci minha senha"
			subtitle="Informe seu email para receber o link de redefinição."
			footer={
				<Link
					href="/login"
					className="font-medium text-primary hover:underline"
				>
					Voltar para entrar
				</Link>
			}
		>
			<ForgotPasswordForm />
		</AuthShell>
	);
}
