// =============================================
// CORE TYPES & ENUMS
// =============================================

export type Role = "manager" | "salesman" | "warehouse" | "cashier";

export type OrderSource = "pos" | "sales" | "web";

export type PaymentType = "cash" | "tempo";

export type OrderStatus = "pending" | "processed" | "shipped" | "completed" | "cancelled";

export type StockReason = "sale" | "restock" | "adjustment" | "return";

// =============================================
// PROFILES
// =============================================

export interface Profile {
  id: string;
  full_name: string | null;
  role: Role;
  created_at: string;
}

// =============================================
// PRODUCTS
// =============================================

export interface Product {
  id: string;
  name: string;
  sku: string | null;
  price_buy: number;
  price_sell: number;
  stock_current: number;
  stock_min: number;
  is_active: boolean;
  image_url?: string | null;
  created_at: string;
}

// =============================================
// CUSTOMERS
// =============================================

export interface Customer {
  id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  credit_limit: number;
  created_at: string;
}

// =============================================
// ORDERS
// =============================================

export interface Order {
  id: string;
  customer_id: string | null;
  salesman_id: string | null;
  order_source: OrderSource;
  total_amount: number;
  status: OrderStatus;
  payment_type: PaymentType;
  cash_tendered: number;
  cash_change: number;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_transaction: number;
}

// =============================================
// CART
// =============================================

export interface CartItem {
  product_id: string;
  product_name: string;
  price_at_transaction: number;
  quantity: number;
}

// =============================================
// STOCK MOVEMENTS
// =============================================

export interface StockMovement {
  id: string;
  product_id: string;
  change_amount: number;
  reason: StockReason;
  created_at: string;
}

// =============================================
// GEOLOCATION
// =============================================

export interface Coordinates {
  lat: number;
  lng: number;
  accuracy: number;
}