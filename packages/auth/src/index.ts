import { env } from "@valora/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { prisma } from "./prisma";

export function createAuth() {
	return betterAuth({
		database: prismaAdapter(prisma, { provider: "mysql" }),
		trustedOrigins: [env.CORS_ORIGIN],
		emailAndPassword: {
			enabled: true,
			minPasswordLength: 8,
			sendResetPassword: async ({ user, url }) => {
				if (env.NODE_ENV === "production") {
					// TODO: plug a real mailer (Resend, etc.) before going to prod
					console.warn(
						"[auth] sendResetPassword called in production without a mailer configured",
					);
				}
				console.info(`[auth] password reset link for ${user.email}: ${url}`);
			},
		},
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		plugins: [nextCookies()],
	});
}

export const auth = createAuth();
