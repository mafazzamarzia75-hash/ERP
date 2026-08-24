"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  BarChart3,
  Settings,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Produk", icon: Package },
  { href: "/dashboard/orders", label: "Pesanan", icon: ShoppingCart },
  { href: "/dashboard/customers", label: "Pelanggan", icon: Users },
  { href: "/dashboard/warehouse", label: "Gudang", icon: Warehouse },
  { href: "/dashboard/reports", label: "Laporan", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="text-lg font-bold text-primary">
          Sanvinal ERP
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <Settings className="h-5 w-5" />
          Pengaturan
        </Link>
      </div>
    </aside>
  );
}