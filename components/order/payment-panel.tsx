"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/utils";

interface PaymentPanelProps {
  totalAmount: number;
  paymentType: "cash" | "tempo";
  onPaymentTypeChange: (type: "cash" | "tempo") => void;
  onCashTenderedChange: (amount: number) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export function PaymentPanel({
  totalAmount,
  paymentType,
  onPaymentTypeChange,
  onCashTenderedChange,
  onSubmit,
  isLoading,
}: PaymentPanelProps) {
  const [cashTendered, setCashTendered] = useState<number>(0);
  const cashChange = cashTendered - totalAmount;

  const handleCashChange = (value: string) => {
    const amount = Number(value) || 0;
    setCashTendered(amount);
    onCashTenderedChange(amount);
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">Pembayaran</h3>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onPaymentTypeChange("cash")}
          className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
            paymentType === "cash"
              ? "border-primary bg-primary/10 text-primary"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          Lunas (Cash)
        </button>
        <button
          type="button"
          onClick={() => onPaymentTypeChange("tempo")}
          className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
            paymentType === "tempo"
              ? "border-primary bg-primary/10 text-primary"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          Tempo (Utang)
        </button>
      </div>

      {paymentType === "cash" ? (
        <div className="space-y-3">
          <Input
            type="number"
            min="0"
            placeholder="Uang diterima"
            onChange={(e) => handleCashChange(e.target.value)}
          />
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Kembalian</span>
            <span className={cashChange < 0 ? "text-red-600 font-medium" : "font-medium"}>
              {formatRupiah(Math.max(cashChange, 0))}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500">
          Pembayaran tempo akan dicatat sebagai piutang pelanggan.
        </p>
      )}

      <Button
        className="w-full"
        onClick={onSubmit}
        disabled={
          isLoading ||
          (paymentType === "cash" && cashTendered < totalAmount)
        }
      >
        {isLoading ? "Memproses..." : `Bayar ${formatRupiah(totalAmount)}`}
      </Button>
    </div>
  );
}