"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { signInSchema } from "../schemas";
import { AuthField } from "./auth-field";
import { AuthSubmit } from "./auth-submit";

export function SignInForm() {
  const router = useRouter();

  const form = useForm({
    defaultValues: { email: "", password: "", remember: false },
    validators: { onSubmit: signInSchema },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        { email: value.email, password: value.password, rememberMe: value.remember },
        {
          onSuccess: () => {
            toast.success("Login realizado");
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
            placeholder="Digite sua senha"
            type="password"
            autoComplete="current-password"
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>

      <div className="flex items-center justify-between pt-1">
        <form.Field name="remember">
          {(field) => (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="size-[18px] rounded-md border border-border bg-card accent-primary"
              />
              Lembrar por 30 dias
            </label>
          )}
        </form.Field>
        <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
          Esqueci minha senha
        </Link>
      </div>

      <div className="pt-3">
        <form.Subscribe selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}>
          {({ canSubmit, isSubmitting }) => (
            <AuthSubmit type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </AuthSubmit>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
