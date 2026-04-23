import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="dark min-h-svh bg-background text-foreground">
      <div className="mx-auto grid min-h-svh w-full max-w-[1440px] grid-cols-1 gap-10 p-6 lg:grid-cols-2 lg:p-10">
        <div className="flex flex-col justify-center">
          <div className="w-full max-w-[520px] mx-auto">
            <Link href="/" className="mb-12 flex items-center gap-3">
              <span className="inline-flex size-[56px] items-center justify-center rounded-[20px] bg-card">
                <span className="size-6 rounded-md bg-primary" />
              </span>
              <span className="text-2xl font-semibold text-foreground">valora</span>
            </Link>
            <div className="mb-8 space-y-3">
              <h1 className="text-[28px] font-medium leading-tight text-foreground">{title}</h1>
              <p className="text-base text-muted-foreground">{subtitle}</p>
            </div>
            {children}
            {footer ? <div className="mt-6 text-center text-base">{footer}</div> : null}
          </div>
        </div>
        <div className="hidden rounded-[30px] border border-black bg-[linear-gradient(135deg,#1a1d22_0%,#0a0b0d_100%)] lg:block" />
      </div>
    </div>
  );
}
