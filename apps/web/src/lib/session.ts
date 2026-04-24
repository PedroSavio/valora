import { auth } from "@valora/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getSession() {
	return auth.api.getSession({ headers: await headers() });
}

export async function requireSession() {
	const session = await getSession();
	if (!session?.user) redirect("/login");
	return session;
}

export async function requireUserId(): Promise<string> {
	const session = await getSession();
	if (!session?.user) throw new Error("unauthorized");
	return session.user.id;
}
