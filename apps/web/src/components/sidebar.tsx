"use client";

import {
	BarChart3,
	FileText,
	LogOut,
	Receipt,
	Settings,
	TrendingUp,
	User,
} from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

type NavItem = {
	href: string;
	label: string;
	icon: typeof BarChart3;
	badge?: string;
};

const PRIMARY_NAV: NavItem[] = [
	{ href: "/dashboard", label: "Visão geral", icon: BarChart3 },
	{ href: "/incomes", label: "Entradas", icon: TrendingUp },
	{ href: "/debts", label: "Dívidas", icon: Receipt },
	{ href: "/bills/new", label: "Importar fatura", icon: FileText },
	{ href: "/profile", label: "Perfil", icon: User },
	{ href: "/settings", label: "Configurações", icon: Settings },
];

function isActive(pathname: string, href: string) {
	if (href === "/dashboard") return pathname === "/dashboard";
	return pathname.startsWith(href);
}

export function Sidebar() {
	const pathname = usePathname();
	const router = useRouter();

	async function handleLogout() {
		await authClient.signOut({
			fetchOptions: { onSuccess: () => router.push("/login") },
		});
	}

	return (
		<aside
			className="flex shrink-0 items-center justify-between border-[#222] bg-black max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-40 max-lg:h-16 max-lg:border-t max-lg:px-3 lg:h-svh lg:w-[85px] lg:flex-col lg:border-r lg:py-6"
			aria-label="Navegação principal"
		>
			<Link
				href="/dashboard"
				aria-label="valora"
				className="hidden size-[53px] items-center justify-center overflow-hidden rounded-full bg-[#17191C] lg:flex"
			>
				<Image src="/logo.svg" alt="valora" width={32} height={32} priority />
			</Link>

			<nav className="flex flex-1 items-center justify-around gap-2 lg:flex-col lg:justify-center lg:gap-3">
				{PRIMARY_NAV.map((item) => (
					<SideLink
						key={item.href}
						item={item}
						active={isActive(pathname, item.href)}
					/>
				))}
			</nav>

			<IconButton label="Sair" icon={LogOut} onClick={handleLogout} />
		</aside>
	);
}

function SideLink({ item, active }: { item: NavItem; active: boolean }) {
	const Icon = item.icon;
	return (
		<Link
			href={item.href as Route}
			aria-label={item.label}
			aria-current={active ? "page" : undefined}
			className={`relative flex size-11 items-center justify-center rounded-xl transition-colors ${
				active
					? "bg-primary text-primary-foreground"
					: "text-[#868686] hover:bg-[#17191C] hover:text-foreground"
			}`}
		>
			<Icon className="size-5" />
			{item.badge ? (
				<span className="absolute -top-1 -right-1 flex min-w-[22px] items-center justify-center rounded-full border-2 border-black bg-[#AA9C75] px-1 font-semibold text-[10px] text-black">
					{item.badge}
				</span>
			) : null}
		</Link>
	);
}

function IconButton({
	label,
	icon: Icon,
	onClick,
}: {
	label: string;
	icon: typeof BarChart3;
	onClick?: () => void;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			onClick={onClick}
			className="flex size-11 shrink-0 items-center justify-center rounded-xl text-[#868686] transition-colors hover:bg-[#17191C] hover:text-foreground"
		>
			<Icon className="size-5" />
		</button>
	);
}
