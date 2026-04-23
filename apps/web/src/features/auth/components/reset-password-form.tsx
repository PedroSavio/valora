"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { resetSchema } from "../schemas";
import { AuthField } from "./auth-field";
import { AuthSubmit } from "./auth-submit";

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const form = useForm({
    defaultValues: { password: "" },
    validators: { onSubmit: resetSchema },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error("Token inválido ou ausente");
        return;
      }
      await authClient.resetPassword(
        { newPassword: value.password, token },
        {
          onSuccess: () => {
            toast.success("Senha redefinida");
            router.push("/login");
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
      <form.Field name="password">
        {(field) => (
          <AuthField
            label="Nova senha"
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
        <form.Subscribe selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}>
          {({ canSubmit, isSubmitting }) => (
            <AuthSubmit type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Salvando..." : "Redefinir senha"}
            </AuthSubmit>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
