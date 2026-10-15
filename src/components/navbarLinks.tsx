"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";

type NavLink = { name: string; href: string };

export default function NavbarLinks({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();

  // On the sign-in page itself ("/auth" or "/auth/...", but not "/auth-dashboard"),
  // offer a way back to the translator instead of a pointless "Sign in" link
  const onAuthPage = pathname === "/auth" || pathname.startsWith("/auth/");

  const links: NavLink[] = onAuthPage
    ? [{ name: "Translate", href: "/" }]
    : signedIn
      ? [
          { name: "My translations", href: "/translations" },
          { name: "User", href: "/auth-dashboard" },
        ]
      : [{ name: "Sign in", href: "/auth" }];

  // Segment-aware, so "/auth" doesn't count as active on "/auth-dashboard"
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="w-full bg-[#FFB86B]">
      <nav
        aria-label="Main"
        className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-8"
      >
        {/* Logo: icon only, links to the translator at / */}
        <Link
          href="/"
          aria-label="Translate home"
          className="grid h-11 w-11 place-items-center rounded-xl bg-[#4A2208] text-[#FFB86B] shadow-[0_2px_0_#B85C1E] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A2208]"
        >
          <Languages aria-hidden="true" className="h-6 w-6" />
        </Link>

        <ul className="flex items-center gap-2">
          {links.map((link) => {
            const active = isActive(link.href);
            // "Sign in" (signed out) and "Translate" (on /auth) are the filled call-to-action
            const filled = onAuthPage || !signedIn || active;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-full px-4 py-2 text-[15px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A2208] ${
                    filled
                      ? "bg-[#4A2208] text-[#FFB86B] hover:bg-[#5C2A0A]"
                      : "text-[#5C2A0A] hover:bg-[#5C2A0A]/10"
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}