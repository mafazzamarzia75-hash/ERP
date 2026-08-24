import { ProductsView } from "@/views/dashboard/products-view";

export const metadata = {
  title: "Manajemen Produk",
};

export const dynamic = "force-dynamic";

export default function ProductsPage() {
  return <ProductsView />;
}