"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";
import { useStockMovements } from "@/hooks/useStockMovements";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LowStockAlert } from "@/components/dashboard/low-stock-alert";
import { formatRupiah } from "@/lib/utils";
import { Package, Truck } from "lucide-react";

const statusBadgeVariant: Record<string, "default" | "success" | "warning" | "destructive" | "outline"> = {
  pending: "warning",
  processed: "default",
  shipped: "success",
  completed: "outline",
  cancelled: "destructive",
};

export function WarehouseView() {
  const { products, isLoading: isLoadingProducts } = useProducts(false);
  const { orders, isLoading: isLoadingOrders } = useOrders();
  const { movements } = useStockMovements();

  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredOrders = selectedStatus === "all"
    ? orders
    : orders.filter((order) => order.status === selectedStatus);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal update status");
      }
    } catch (err) {
      console.error("Gagal update status:", err);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Gudang</h1>
        <p className="text-sm text-gray-500">Sinkronisasi stok & status pesanan</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <LowStockAlert products={products} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Ringkasan Stok
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Produk</span>
                  <span className="font-medium">{products.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Stok</span>
                  <span className="font-medium">
                    {products.reduce((sum, p) => sum + p.stock_current, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Nilai Stok</span>
                  <span className="font-medium">
                    {formatRupiah(
                      products.reduce((sum, p) => sum + p.price_buy * p.stock_current, 0)
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Pipeline Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">
                {["all", "pending", "processed", "shipped", "completed", "cancelled"].map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={selectedStatus === status ? "default" : "outline"}
                    onClick={() => setSelectedStatus(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>

              {isLoadingOrders ? (
                <p className="text-sm text-gray-400">Memuat pesanan...</p>
              ) : filteredOrders.length === 0 ? (
                <p className="text-sm text-gray-400">Tidak ada pesanan.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Order</TableHead>
                      <TableHead>Sumber</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
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
                        <TableCell>
                          {order.status === "pending" ? (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, "processed")}
                            >
                              Proses
                            </Button>
                          ) : order.status === "processed" ? (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, "shipped")}
                            >
                              Kirim
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mutasi Stok Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              {movements.length === 0 ? (
                <p className="text-sm text-gray-400">Belum ada mutasi stok.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead>Perubahan</TableHead>
                      <TableHead>Alasan</TableHead>
                      <TableHead>Waktu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.slice(0, 10).map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>{movement.product_id.slice(0, 8)}</TableCell>
                        <TableCell className={movement.change_amount < 0 ? "text-red-600" : "text-emerald-600"}>
                          {movement.change_amount > 0 ? "+" : ""}
                          {movement.change_amount}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{movement.reason}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {new Date(movement.created_at).toLocaleString("id-ID")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}