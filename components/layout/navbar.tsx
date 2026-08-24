"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShoppingCart, Store } from "lucide-react";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/store", label: "Etalase" },
];

export function Navbar({ cartCount = 0 }: { cartCount?: number }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Store className="h-5 w-5 text-primary" />
          <span>Sanvinal</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/pos"
            className="ml-2 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            POS
            {cartCount > 0 ? (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </nav>
      </div>
    </header>
  );
}