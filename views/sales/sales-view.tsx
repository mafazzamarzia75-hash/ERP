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
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_source: "sales",
          payment_type: paymentType,
          cash_tendered: cashTendered,
          customer_id: selectedCustomerId || undefined,
          items: items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Pesanan gagal");
      }

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