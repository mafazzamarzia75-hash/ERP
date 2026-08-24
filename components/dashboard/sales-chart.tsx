"use client";

import { Order } from "@/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface SalesChartProps {
  orders: Order[];
}

interface DailyTotal {
  date: string;
  total: number;
  count: number;
}

export function SalesChart({ orders }: SalesChartProps) {
  const dailyTotals = orders.reduce<Record<string, DailyTotal>>((acc, order) => {
    const dateKey = format(new Date(order.created_at), "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = { date: dateKey, total: 0, count: 0 };
    }
    acc[dateKey].total += order.total_amount;
    acc[dateKey].count += 1;
    return acc;
  }, {});

  const chartData = Object.values(dailyTotals)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7); // tampilkan 7 hari terakhir

  const maxTotal = Math.max(...chartData.map((d) => d.total), 1);

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold mb-4">Penjualan 7 Hari Terakhir</h3>

      {chartData.length === 0 ? (
        <p className="text-sm text-gray-400">Belum ada data penjualan.</p>
      ) : (
        <div className="flex items-end gap-2 h-40">
          {chartData.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-500 font-medium">
                {day.total > 0
                  ? new Intl.NumberFormat("id-ID", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(day.total)
                  : ""}
              </span>
              <div
                className="w-full rounded-t bg-gradient-to-t from-primary to-primary/60 transition-all"
                style={{ height: `${(day.total / maxTotal) * 120}px` }}
                title={`${day.total} - ${day.count} pesanan`}
              />
              <span className="text-[10px] text-gray-400">
                {format(new Date(day.date), "EEE", { locale: id })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}