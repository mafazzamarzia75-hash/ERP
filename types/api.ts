// =============================================
// API REQUEST/RESPONSE TYPES
// =============================================

import type { Order, OrderSource, PaymentType, Product, Customer } from "./index";

// =============================================
// GENERIC RESPONSE
// =============================================

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  errors?: { path: string; message: string }[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// =============================================
// PRODUCTS
// =============================================

export interface CreateProductInput {
  name: string;
  sku?: string;
  price_buy: number;
  price_sell: number;
  stock_current: number;
  stock_min?: number;
  is_active?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  sku?: string;
  price_buy?: number;
  price_sell?: number;
  stock_current?: number;
  stock_min?: number;
  is_active?: boolean;
}

// =============================================
// ORDERS
// =============================================

export interface CreateOrderInput {
  order_source: OrderSource;
  payment_type: PaymentType;
  cash_tendered?: number;
  customer_id?: string;
  salesman_id?: string;
  items: {
    product_id: string;
    quantity: number;
  }[];
}

export interface UpdateOrderStatusInput {
  status: Order["status"];
}

// =============================================
// CUSTOMERS
// =============================================

export interface CreateCustomerInput {
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  credit_limit?: number;
}

export interface UpdateCustomerInput {
  name?: string;
  address?: string;
  lat?: number;
  lng?: number;
  credit_limit?: number;
}

// =============================================
// DASHBOARD
// =============================================

export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  lowStockCount: number;
  channelSummary: {
    source: OrderSource;
    count: number;
    revenue: number;
  }[];
}