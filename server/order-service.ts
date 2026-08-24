import { createClient } from "@/lib/supabase/server";
import type { CartItem, Order, OrderSource, PaymentType } from "@/types";

interface CreateOrderInput {
  orderSource: OrderSource;
  paymentType: PaymentType;
  cashTendered?: number;
  customerId?: string;
  salesmanId?: string;
  items: CartItem[];
}

interface CreateOrderResult {
  order: Order;
  items: CartItem[];
}

/**
 * Membuat pesanan baru dengan validasi bisnis lengkap.
 * - Kanal web WAJIB cash (lunas)
 * - Validasi stok mencukupi
 * - Hitung total & kembalian
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const supabase = createClient();

  // ===== VALIDASI 1: Kanal web wajib cash =====
  if (input.orderSource === "web" && input.paymentType !== "cash") {
    throw new Error("Kanal web hanya mendukung pembayaran lunas (cash)");
  }

  // ===== VALIDASI 2: Keranjang tidak boleh kosong =====
  if (input.items.length === 0) {
    throw new Error("Keranjang tidak boleh kosong");
  }

  // ===== VALIDASI 3: Ambil data produk & cek stok =====
  const productIds = input.items.map((item) => item.product_id);
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id, name, price_sell, stock_current")
    .in("id", productIds);

  if (productError) throw productError;

  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of input.items) {
    const product = productMap.get(item.product_id);
    if (!product) {
      throw new Error(`Produk ${item.product_id} tidak ditemukan`);
    }
    if (product.stock_current < item.quantity) {
      throw new Error(`Stok ${product.name} tidak mencukupi`);
    }
  }

  // ===== HITUNG TOTAL =====
  const totalAmount = input.items.reduce(
    (sum, item) => sum + item.price_at_transaction * item.quantity,
    0
  );

  // ===== VALIDASI 4: Pembayaran cash harus >= total =====
  if (input.paymentType === "cash" && (input.cashTendered ?? 0) < totalAmount) {
    throw new Error("Uang yang dibayarkan kurang dari total");
  }

  const cashChange =
    input.paymentType === "cash" ? (input.cashTendered ?? 0) - totalAmount : 0;

  // ===== INSERT ORDER HEADER =====
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: input.customerId ?? null,
      salesman_id: input.salesmanId ?? null,
      order_source: input.orderSource,
      total_amount: totalAmount,
      status: "pending",
      payment_type: input.paymentType,
      cash_tendered: input.cashTendered ?? 0,
      cash_change: cashChange,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // ===== INSERT ORDER ITEMS =====
  const orderItems = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_transaction: item.price_at_transaction,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return { order, items: input.items };
}