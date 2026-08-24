import { PosView } from "@/views/pos/pos-view";

export const metadata = {
  title: "POS Kasir",
};

export const dynamic = "force-dynamic";

export default function PosPage() {
  return <PosView />;
}