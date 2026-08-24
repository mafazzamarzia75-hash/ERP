import { WarehouseView } from "@/views/warehouse/warehouse-view";

export const metadata = {
  title: "Gudang",
};

export const dynamic = "force-dynamic";

export default function WarehousePage() {
  return <WarehouseView />;
}