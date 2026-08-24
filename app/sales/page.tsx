import { SalesView } from "@/views/sales/sales-view";

export const metadata = {
  title: "Salesman",
};

export const dynamic = "force-dynamic";

export default function SalesPage() {
  return <SalesView />;
}