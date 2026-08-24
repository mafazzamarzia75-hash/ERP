# TypeScript Types & Interfaces — Documentasi

Dokumen ini mendefinisikan *shared types* dan interface global untuk seluruh aplikasi sehingga semua layer (UI, state, API) memiliki kontrak data yang konsisten.

---

## 🧱 Struktur File

```
src/
├── types/
│   ├── index.ts              # Re-export semua types
│   ├── product.ts            # Types terkait produk & kategori
│   ├── customer.ts           # Types terkait pelanggan
│   ├── order.ts              # Types transaksi / order
│   ├── payment.ts            # Types pembayaran / metode bayar
│   ├── shipment.ts           # Types pengiriman / ekspedisi
│   ├── stock.ts              # Types inventaris / stok
│   ├── auth.ts               # Types otentikasi, role, dan sesi
│   ├── gps.ts                # Types GeoLocation / GPS
│   └── index.ts              # Barrel export
```

---

## 1️⃣ Type `Product`

```ts
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category?: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

---

## 2️⃣ Order & OrderItem

```ts
export interface Order {
  id: string;
  customer_id: string;
  cashier_id: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  payment_method: 'cash' | 'qris' | 'transfer' | 'credit';
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}
```

## 3️⃣ Tabel: `suppliers`

```sql
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## 4️⃣ Tabel: `warehouse_stock`

```sql
CREATE TABLE warehouse_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  max_stock INTEGER NOT NULL DEFAULT 100,
  reorder_point INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, warehouse_id)
);
```

### Tabel `stock_movements`

Lacak pergerakan stok (inbound/outbound/adjustment) per produk untuk keperluan audit.

```sql
CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  change_type TEXT CHECK (change_type IN ('in', 'out', 'adjustment', 'sale')),
  quantity_change INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL DEFAULT 0,
  new_stock INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### ⚙️ **Spesifikasi Produk**: Struktur Tabel yang Disepakati

```sql
-- PENOMORAN: NOMOR URUT 9 ---
-- total_line: Jumlah baris yang ada saat ini: 23 baris
-- total_tokens: Estimasi token: 923 (Model GPT-4o)

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(100),
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(12, 2),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  minimum_stock INT NOT NULL DEFAULT 0,
  description TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);
```

</details>

---

## 📦 **Struktur Database Lengkap**

Berikut merupakan struktur database lengkap Supabase untuk aplikasi **Sanber Marketplace & GoERP** — menggunakan PostgreSQL.

### 1️⃣ Tabel `profiles`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID | Primary Key, references `auth.users.id` |
| `email` | TEXT | NOT NULL, UNIQUE |
| `full_name` | TEXT | NULL |
| `avatar_url` | TEXT | NULL |
| `role` | TEXT | `(manager, cashier, salesman)` |
| `created_at` | TIMESTAMPTZ | default `now()` |

```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'customer',
  created_at timestamptz DEFAULT now()
);
```

### Tabel: `profiles` & `warehouses` & `categories`

```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL CHECK (role IN ('customer', 'cashier', 'salesman', 'manager')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);
```

</details>

---

## 🖥️ **Backend Authentication**

```typescript
// lib/auth.ts
"use server";

import { createServerClient } from "@supabase/ssr";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { readUserToken } from "./supabase";

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  },
};

export function createServerClient() {
  return createServerClientSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function getSession() {
  return createServerClientSupabase.auth.getSession();
}

export async function requireUser() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireManager() {
  const user = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== 'manager') throw new Error("FORBIDDEN");
  return user;
}
```

</details>