import Link from "next/link";
import { Store, ShoppingCart, MapPin, Warehouse, LayoutDashboard } from "lucide-react";

const modules = [
  {
    href: "/store",
    title: "Etalase Publik",
    description: "Katalog produk & checkout cash-only",
    icon: Store,
  },
  {
    href: "/pos",
    title: "POS Kasir",
    description: "Transaksi langsung di toko",
    icon: ShoppingCart,
  },
  {
    href: "/sales",
    title: "Salesman",
    description: "Pesanan lapangan & geotagging",
    icon: MapPin,
  },
  {
    href: "/warehouse",
    title: "Gudang",
    description: "Stok real-time & pipeline pesanan",
    icon: Warehouse,
  },
  {
    href: "/dashboard",
    title: "Dasbor Manajer",
    description: "Omset, piutang & rekapitulasi",
    icon: LayoutDashboard,
  },
];

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Sanvinal <span className="text-primary">Mini-ERP</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
          Sistem manajemen usaha terintegrasi: etalase publik, POS toko, sales
          lapangan, gudang, dan dasbor manajer dalam satu platform.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.href}
              href={module.href}
              className="group rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                {module.title}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{module.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}