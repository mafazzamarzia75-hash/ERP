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

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_source: "web",
          payment_type: "cash",
          cash_tendered: cashTendered,
          items: items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Checkout gagal");
      }

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