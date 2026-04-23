import Link from "next/link";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export default function LoginPage() {
  return (
    <AuthShell
      title="Entrar na sua conta"
      subtitle="Acesse seu painel financeiro com segurança."
      footer={
        <span className="text-muted-foreground">
          Não tem conta?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Criar conta
          </Link>
        </span>
      }
    >
      <SignInForm />
    </AuthShell>
  );
}
