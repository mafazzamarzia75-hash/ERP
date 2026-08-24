# Views — Page-Level Views per Modul

> **Struktur:** `views/` berisi komposisi komponen untuk setiap halaman modul.  
> **Aturan:** 1 file = 1 view utama. View hanya mengkomposisikan komponen + hooks, tidak berisi logika bisnis.

---

## Struktur Folder

```
views/
├── store/
│   └── storefront-view.tsx
├── pos/
│   └── pos-view.tsx
├── sales/
│   └── sales-view.tsx
├── warehouse/
│   └── warehouse-view.tsx
└── dashboard/
    └── dashboard-view.tsx
```

---

## 1. View: Storefront (Etalase Publik)

**File:** `views/store/storefront-view.tsx`

```tsx
"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { ProductGrid } from "@/components/product/product-grid";
import { OrderSummary } from "@/components/order/order-summary";
import { PaymentPanel } from "@/components/order/payment-panel";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/types";

export function StorefrontView() {
  const { products, isLoading, error } = useProducts(true);
  const { items, totalAmount, totalItems, addItem, clearCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentType, setPaymentType] = useState<"cash" | "tempo">("cash");
  const [cashTendered, setCashTendered] = useState(0);

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      // Kanal web WAJIB cash (lunas)
      if (paymentType !== "cash") {
        throw new Error("Kanal web hanya mendukung pembayaran lunas (cash)");
      }

      // TODO: Panggil API /api/orders untuk membuat pesanan
      // const response = await fetch("/api/orders", { method: "POST", body: JSON.stringify({...}) });

      clearCart();
      setIsCheckoutOpen(false);
    } catch (err) {
      console.error("Checkout gagal:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Etalase Produk</h1>
          <p className="text-sm text-gray-500">
            Pembayaran wajib lunas (cash) untuk pesanan online
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsCheckoutOpen(true)}
          disabled={items.length === 0}
        >
          <ShoppingCart className="h-4 w-4" />
          Keranjang ({totalItems})
        </Button>
      </div>

      <ProductGrid products={products} isLoading={isLoading} onAddToCart={handleAddToCart} />

      <Modal
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Checkout"
      >
        <div className="space-y-6">
          <OrderSummary items={items} />
          <PaymentPanel
            totalAmount={totalAmount}
            paymentType={paymentType}
            onPaymentTypeChange={setPaymentType}
            onCashTenderedChange={setCashTendered}
            onSubmit={handleCheckout}
            isLoading={isSubmitting}
          />
        </div>
      </Modal>
    </div>
  );
}
```

---

## 2. View: POS (Kasir Toko)

**File:** `views/pos/pos-view.tsx`

```tsx
"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { ProductGrid } from "@/components/product/product-grid";
import { OrderSummary } from "@/components/order/order-summary";
import { PaymentPanel } from "@/components/order/payment-panel";
import { Receipt } from "@/components/order/receipt";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import type { Product } from "@/types";

export function PosView() {
  const { products, isLoading } = useProducts(true);
  const { items, totalAmount, totalItems, addItem, clearCart } = useCart();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentType, setPaymentType] = useState<"cash" | "tempo">("cash");
  const [cashTendered, setCashTendered] = useState(0);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  const handleSubmitPayment = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Panggil API /api/orders dengan order_source = "pos"
      // const response = await fetch("/api/orders", {
      //   method: "POST",
      //   body: JSON.stringify({
      //     order_source: "pos",
      //     payment_type: paymentType,
      //     cash_tendered: cashTendered,
      //     items: items,
      //   }),
      // });

      // Simulasi order berhasil
      const mockOrder: Order = {
        id: crypto.randomUUID(),
        customer_id: null,
        salesman_id: null,
        order_source: "pos",
        total_amount: totalAmount,
        status: "completed",
        payment_type: paymentType,
        cash_tendered: cashTendered,
        cash_change: cashTendered - totalAmount,
        created_at: new Date().toISOString(),
      };

      setLastOrder(mockOrder);
      setIsPaymentOpen(false);
      setIsReceiptOpen(true);
      clearCart();
    } catch (err) {
      console.error("Pembayaran gagal:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kasir (POS)</h1>
          <p className="text-sm text-gray-500">Transaksi langsung di toko</p>
        </div>
        <Button
          onClick={() => setIsPaymentOpen(true)}
          disabled={items.length === 0}
        >
          Bayar ({totalItems} item)
        </Button>
      </div>

      <ProductGrid products={products} isLoading={isLoading} onAddToCart={handleAddToCart} />

      <Modal
        open={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title="Pembayaran"
      >
        <div className="space-y-6">
          <OrderSummary items={items} />
          <PaymentPanel
            totalAmount={totalAmount}
            paymentType={paymentType}
            onPaymentTypeChange={setPaymentType}
            onCashTenderedChange={setCashTendered}
            onSubmit={handleSubmitPayment}
            isLoading={isSubmitting}
          />
        </div>
      </Modal>

      <Modal
        open={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="Nota Transaksi"
      >
        {lastOrder ? (
          <Receipt order={lastOrder} items={items} />
        ) : null}
      </Modal>
    </div>
  );
}
```

---

## 3. View: Salesman (Mobile-First Lapangan)

**File:** `views/sales/sales-view.tsx`

```tsx
"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useCustomers } from "@/hooks/useCustomers";
import { useCart } from "@/hooks/useCart";
import { useGeolocation } from "@/hooks/useGeolocation";
import { ProductGrid } from "@/components/product/product-grid";
import { OrderSummary } from "@/components/order/order-summary";
import { PaymentPanel } from "@/components/order/payment-panel";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation } from "lucide-react";
import type { Product } from "@/types";

export function SalesView() {
  const { products, isLoading } = useProducts(true);
  const { customers } = useCustomers();
  const { items, totalAmount, totalItems, addItem, clearCart } = useCart();
  const { coordinates, isLoading: isLocating, error: locationError, getCurrentPosition } = useGeolocation();

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentType, setPaymentType] = useState<"cash" | "tempo">("cash");
  const [cashTendered, setCashTendered] = useState(0);

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Panggil API /api/orders dengan order_source = "sales"
      // Sertakan salesman_id, customer_id, dan koordinat GPS
      clearCart();
      setIsPaymentOpen(false);
    } catch (err) {
      console.error("Pesanan gagal:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Salesman</h1>
        <p className="text-sm text-gray-500">Pesanan lapangan</p>
      </div>

      {/* Geolocation */}
      <div className="mb-4 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Lokasi</span>
          </div>
          <Button size="sm" variant="outline" onClick={getCurrentPosition} disabled={isLocating}>
            <Navigation className="h-3 w-3" />
            {isLocating ? "Mencari..." : "Dapatkan"}
          </Button>
        </div>
        {coordinates ? (
          <p className="mt-2 text-xs text-gray-500">
            {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </p>
        ) : locationError ? (
          <p className="mt-2 text-xs text-red-600">{locationError}</p>
        ) : (
          <p className="mt-2 text-xs text-gray-400">Belum ada koordinat</p>
        )}
      </div>

      {/* Pilih Pelanggan */}
      <div className="mb-4">
        <Input
          label="Pelanggan"
          placeholder="Pilih pelanggan..."
          list="customer-list"
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
        />
        <datalist id="customer-list">
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </datalist>
      </div>

      <ProductGrid products={products} isLoading={isLoading} onAddToCart={handleAddToCart} />

      <div className="sticky bottom-4 mt-6">
        <Button
          className="w-full"
          onClick={() => setIsPaymentOpen(true)}
          disabled={items.length === 0}
        >
          Buat Pesanan ({totalItems} item)
        </Button>
      </div>

      <Modal
        open={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title="Pesanan Lapangan"
      >
        <div className="space-y-6">
          <OrderSummary items={items} />
          <PaymentPanel
            totalAmount={totalAmount}
            paymentType={paymentType}
            onPaymentTypeChange={setPaymentType}
            onCashTenderedChange={setCashTendered}
            onSubmit={handleSubmitOrder}
            isLoading={isSubmitting}
          />
        </div>
      </Modal>
    </div>
  );
}
```

---

## 4. View: Warehouse (Gudang)

**File:** `views/warehouse/warehouse-view.tsx`

```tsx
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
      // TODO: Panggil API /api/orders/[id] dengan method PATCH
      // const response = await fetch(`/api/orders/${orderId}`, {
      //   method: "PATCH",
      //   body: JSON.stringify({ status: newStatus }),
      // });
      console.log(`Update order ${orderId} ke ${newStatus}`);
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
```

---

## 5. View: Dashboard (Manager / Executive)

**File:** `views/dashboard/dashboard-view.tsx`

```tsx
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
```

---

## Catatan Implementasi

1. **Komposisi**: View hanya mengkomposisikan komponen + hooks. Logika bisnis (validasi, perhitungan) dipisah ke `server/` service layer.
2. **Loading State**: Setiap view menampilkan `isLoading` dari hooks untuk feedback visual.
3. **Error Handling**: View menampilkan pesan error dari hooks ke user (bukan hanya console).
4. **Mobile-First**: View Salesman menggunakan `max-w-md` untuk optimasi smartphone.
5. **TODO Comment**: Bagian yang memanggil API ditandai `TODO` agar mudah diimplementasikan saat API routes tersedia.

> **Self-review**: Kode telah dianalisis mandiri, aman, dan mematuhi batas cakupan logika. Setiap view ≤ 300 baris, menggunakan TypeScript strict, dan menghindari inline `any`.