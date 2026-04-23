"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { forgotSchema } from "../schemas";
import { AuthField } from "./auth-field";
import { AuthSubmit } from "./auth-submit";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  const form = useForm({
    defaultValues: { email: "" },
    validators: { onSubmit: forgotSchema },
    onSubmit: async ({ value }) => {
      await authClient.requestPasswordReset(
        { email: value.email, redirectTo: "/reset-password" },
        {
          onSuccess: () => {
            setSent(true);
            toast.success("Link enviado");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
  });

  if (sent) {
    return (
      <div className="rounded-[18px] border border-border bg-card p-5 text-sm text-muted-foreground">
        Se existir uma conta com esse email, enviamos um link para redefinir sua senha.
      </div>
    );
  }

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

      <div className="pt-3">
        <form.Subscribe selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}>
          {({ canSubmit, isSubmitting }) => (
            <AuthSubmit type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar link"}
            </AuthSubmit>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
