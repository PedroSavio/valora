import { z } from "zod";

export const signInSchema = z.object({
	email: z.email("Informe um email válido"),
	password: z.string().min(8, "Mínimo de 8 caracteres"),
	remember: z.boolean(),
});

export const signUpSchema = z.object({
	name: z.string().min(2, "Mínimo de 2 caracteres"),
	email: z.email("Informe um email válido"),
	password: z.string().min(8, "Mínimo de 8 caracteres"),
});

export const forgotSchema = z.object({
	email: z.email("Informe um email válido"),
});

export const resetSchema = z.object({
	password: z.string().min(8, "Mínimo de 8 caracteres"),
});
