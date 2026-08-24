import { DashboardView } from "@/views/dashboard/dashboard-view";

export const metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return <DashboardView />;
}