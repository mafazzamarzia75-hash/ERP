"use client";

import { useMemo } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useCustomers } from "@/hooks/useCustomers";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { LowStockAlert } from "@/components/dashboard/low-stock-alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah } from "@/lib/utils";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";

const statusBadgeVariant: Record<string, "default" | "success" | "warning" | "destructive" | "outline"> = {
  pending: "warning",
  processed: "default",
  shipped: "success",
  completed: "outline",
  cancelled: "destructive",
};

export function DashboardView() {
  const { orders, isLoading: isLoadingOrders } = useOrders();
  const { products, isLoading: isLoadingProducts } = useProducts(false);
  const { customers, isLoading: isLoadingCustomers } = useCustomers();

  const today = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const todayOrders = orders.filter((o) => o.created_at.slice(0, 10) === today);
    const todayRevenue = todayOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total_amount, 0);
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const lowStockCount = products.filter(
      (p) => p.stock_current <= p.stock_min && p.is_active
    ).length;

    return { todayOrders: todayOrders.length, todayRevenue, pendingOrders, lowStockCount };
  }, [orders, products, today]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">Pusat komando pemilik usaha</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Omset Hari Ini"
          value={formatRupiah(stats.todayRevenue)}
          icon={DollarSign}
          isLoading={isLoadingOrders}
        />
        <StatCard
          title="Pesanan Hari Ini"
          value={stats.todayOrders}
          icon={ShoppingCart}
          isLoading={isLoadingOrders}
        />
        <StatCard
          title="Total Pelanggan"
          value={customers.length}
          icon={Users}
          isLoading={isLoadingCustomers}
        />
        <StatCard
          title="Produk Stok Menipis"
          value={stats.lowStockCount}
          icon={Package}
          isLoading={isLoadingProducts}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SalesChart orders={orders} />

          <Card>
            <CardHeader>
              <CardTitle>Pesanan Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <p className="text-sm text-gray-400">Memuat pesanan...</p>
              ) : orders.length === 0 ? (
                <p className="text-sm text-gray-400">Belum ada pesanan.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Order</TableHead>
                      <TableHead>Sumber</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Waktu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 8).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          {order.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.order_source}</Badge>
                        </TableCell>
                        <TableCell>{formatRupiah(order.total_amount)}</TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant[order.status] ?? "outline"}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleString("id-ID")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <LowStockAlert products={products} />

          <Card>
            <CardHeader>
              <CardTitle>Rekapitulasi Kanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(["pos", "sales", "web"] as const).map((source) => {
                  const sourceOrders = orders.filter((o) => o.order_source === source);
                  const revenue = sourceOrders
                    .filter((o) => o.status !== "cancelled")
                    .reduce((sum, o) => sum + o.total_amount, 0);

                  return (
                    <div key={source} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium uppercase">{source}</p>
                        <p className="text-xs text-gray-500">{sourceOrders.length} pesanan</p>
                      </div>
                      <span className="text-sm font-semibold">{formatRupiah(revenue)}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}