"use client";

import {
  BarChart3,
  Bell,
  FileText,
  HelpCircle,
  LifeBuoy,
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

const primaryNav: NavItem[] = [
  { href: "/dashboard", label: "Visão geral", icon: BarChart3 },
  { href: "/incomes", label: "Entradas", icon: TrendingUp },
  { href: "/bills/new", label: "Importar fatura", icon: FileText },
  { href: "/debts", label: "Dívidas", icon: Receipt },
  { href: "/profile", label: "Perfil", icon: User },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/login") },
    });
  }

  return (
    <aside className="flex h-svh w-[85px] flex-col items-center justify-between border-r border-[#222] bg-black py-6">
      <div className="flex flex-col items-center gap-8">
        <Link
          href="/dashboard"
          aria-label="valora"
          className="flex size-[53px] items-center justify-center overflow-hidden rounded-full bg-[#17191C]"
        >
          <Image src="/logo.svg" alt="valora" width={32} height={32} priority />
        </Link>
        <nav className="flex flex-col items-center gap-3">
          {primaryNav.map((item) => (
            <SideLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </nav>
      </div>
      <div className="flex flex-col items-center gap-3">
        <IconButton label="Sair" icon={LogOut} onClick={handleLogout} />
      </div>
    </aside>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
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
        <span className="absolute -right-1 -top-1 flex min-w-[22px] items-center justify-center rounded-full border-2 border-black bg-[#AA9C75] px-1 text-[10px] font-semibold text-black">
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
      className="flex size-11 items-center justify-center rounded-xl text-[#868686] transition-colors hover:bg-[#17191C] hover:text-foreground"
    >
      <Icon className="size-5" />
    </button>
  );
}
