import { Badge } from "@/components/ui/badge";

interface StockBadgeProps {
  stock: number;
  minStock: number;
}

export function StockBadge({ stock, minStock }: StockBadgeProps) {
  if (stock <= 0) {
    return <Badge variant="destructive">Habis</Badge>;
  }

  if (stock <= minStock) {
    return <Badge variant="warning">Sisa {stock}</Badge>;
  }

  return <Badge variant="success">Stok {stock}</Badge>;
}