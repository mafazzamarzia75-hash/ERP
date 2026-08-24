import { StorefrontView } from "@/views/store/storefront-view";

export const metadata = {
  title: "Etalase",
};

export const dynamic = "force-dynamic";

export default function StorePage() {
  return <StorefrontView />;
}