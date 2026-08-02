"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationItem = {
  name: string;
  icon: string;
  href: string;
  available: boolean;
};

const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    icon: "🏠",
    href: "/",
    available: true,
  },
  {
    name: "Knowledge Library",
    icon: "📚",
    href: "/knowledge",
    available: true,
  },
  {
    name: "Source Manager",
    icon: "🔗",
    href: "/sources",
    available: true,
  },
  {
    name: "Medical Reviews",
    icon: "🩺",
    href: "/medical-reviews",
    available: true,
  },
  {
    name: "Content Factory",
    icon: "🤖",
    href: "/content-factory",
    available: false,
  },
  {
    name: "Carousel Builder",
    icon: "🎨",
    href: "/carousel-builder",
    available: false,
  },
  {
    name: "Publishing",
    icon: "📅",
    href: "/publishing",
    available: false,
  },
  {
    name: "Settings",
    icon: "⚙️",
    href: "/settings",
    available: false,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 flex-col bg-[#0b4d3b] text-white lg:flex">
      <div className="border-b border-white/15 px-7 py-8">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl">
          🎗️
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
          Acoustic Neuroma Warrior
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          ANW AI-COS
        </h2>

        <p className="mt-2 text-sm text-emerald-100">
          Admin Portal
        </p>
      </div>

      <nav
        className="flex-1 space-y-2 px-4 py-6"
        aria-label="Admin navigation"
      >
        {navigationItems.map((item) => {
          const active = isActiveRoute(
            pathname,
            item.href,
          );

          if (!item.available) {
            return (
              <div
                key={item.name}
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-emerald-50/60"
                title="Coming soon"
                aria-disabled="true"
              >
                <span aria-hidden="true">
                  {item.icon}
                </span>

                <span>{item.name}</span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={
                active ? "page" : undefined
              }
              className={
                active
                  ? "flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0b4d3b] shadow-sm"
                  : "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-emerald-50 transition hover:bg-white/10 hover:text-white"
              }
            >
              <span aria-hidden="true">
                {item.icon}
              </span>

              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/15 p-6">
        <p className="text-sm font-semibold">
          You Are Not Alone.
        </p>

        <p className="mt-1 text-xs leading-5 text-emerald-100">
          Trusted education, compassionate support and practical
          resources.
        </p>
      </div>
    </aside>
  );
}

function isActiveRoute(
  pathname: string,
  href: string,
): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}