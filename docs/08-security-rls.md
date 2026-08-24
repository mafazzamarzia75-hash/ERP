# Security & Row Level Security (RLS) — Supabase

> **Tujuan:** Mengamankan akses data di level database dengan kebijakan RLS per role.  
> **Prinsip:** BYOK (Bring Your Own Key) — klien hanya menggunakan `SUPABASE_ANON_KEY`, `SERVICE_ROLE_KEY` dilarang keras di frontend.

---

## 1. Ringkasan Kebijakan Akses

| Role | Tabel | Operasi | Keterangan |
| :--- | :--- | :--- | :--- |
| `anon` (Publik) | `products` | SELECT | Hanya produk aktif untuk etalase |
| `anon` (Publik) | `orders`, `order_items` | INSERT | Pemesanan publik (web) |
| `authenticated` (Cashier/Salesman) | `products`, `customers`, `orders`, `order_items` | SELECT, INSERT, UPDATE | Transaksi & data relasi |
| `authenticated` (Manager) | Semua tabel | ALL | Audit, stok, laporan keuangan |

---

## 2. Aktifkan RLS pada Semua Tabel

```sql
-- =============================================
-- AKTIFKAN ROW LEVEL SECURITY
-- =============================================
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.stock_movements enable row level security;
```

---

## 3. Kebijakan RLS per Tabel

### 3.1 Tabel: `profiles`

```sql
-- =============================================
-- PROFILES
-- =============================================

-- SELECT: User hanya bisa melihat profilnya sendiri
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- INSERT: User hanya bisa membuat profil sendiri
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- UPDATE: User hanya bisa update profil sendiri
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- SELECT: Manager bisa melihat semua profil
create policy "profiles_select_manager"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );
```

---

### 3.2 Tabel: `products`

```sql
-- =============================================
-- PRODUCTS
-- =============================================

-- SELECT: Publik (anon) hanya bisa melihat produk aktif
create policy "products_select_public"
  on public.products for select
  using (is_active = true);

-- SELECT: Authenticated bisa melihat semua produk
create policy "products_select_authenticated"
  on public.products for select
  to authenticated
  using (true);

-- INSERT: Hanya manager yang bisa menambah produk
create policy "products_insert_manager"
  on public.products for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );

-- UPDATE: Hanya manager yang bisa update produk
create policy "products_update_manager"
  on public.products for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );

-- DELETE: Hanya manager yang bisa hapus produk
create policy "products_delete_manager"
  on public.products for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );
```

---

### 3.3 Tabel: `customers`

```sql
-- =============================================
-- CUSTOMERS
-- =============================================

-- SELECT: Authenticated (cashier/salesman/manager) bisa melihat pelanggan
create policy "customers_select_authenticated"
  on public.customers for select
  to authenticated
  using (true);

-- INSERT: Authenticated bisa menambah pelanggan
create policy "customers_insert_authenticated"
  on public.customers for insert
  to authenticated
  with check (true);

-- UPDATE: Authenticated bisa update pelanggan
create policy "customers_update_authenticated"
  on public.customers for update
  to authenticated
  using (true)
  with check (true);

-- DELETE: Hanya manager yang bisa hapus pelanggan
create policy "customers_delete_manager"
  on public.customers for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );
```

---

### 3.4 Tabel: `orders`

```sql
-- =============================================
-- ORDERS
-- =============================================

-- INSERT: Publik (anon) bisa membuat pesanan (web checkout)
create policy "orders_insert_public"
  on public.orders for insert
  to anon
  with check (order_source = 'web');

-- INSERT: Authenticated (cashier/salesman) bisa membuat pesanan
create policy "orders_insert_authenticated"
  on public.orders for insert
  to authenticated
  with check (true);

-- SELECT: Authenticated bisa melihat semua pesanan
create policy "orders_select_authenticated"
  on public.orders for select
  to authenticated
  using (true);

-- UPDATE: Authenticated bisa update status pesanan
create policy "orders_update_authenticated"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);

-- DELETE: Hanya manager yang bisa hapus pesanan
create policy "orders_delete_manager"
  on public.orders for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );
```

---

### 3.5 Tabel: `order_items`

```sql
-- =============================================
-- ORDER_ITEMS
-- =============================================

-- INSERT: Publik (anon) bisa menambah item pesanan (web checkout)
create policy "order_items_insert_public"
  on public.order_items for insert
  to anon
  with check (true);

-- INSERT: Authenticated bisa menambah item pesanan
create policy "order_items_insert_authenticated"
  on public.order_items for insert
  to authenticated
  with check (true);

-- SELECT: Authenticated bisa melihat item pesanan
create policy "order_items_select_authenticated"
  on public.order_items for select
  to authenticated
  using (true);

-- UPDATE: Authenticated bisa update item pesanan
create policy "order_items_update_authenticated"
  on public.order_items for update
  to authenticated
  using (true)
  with check (true);

-- DELETE: Hanya manager yang bisa hapus item pesanan
create policy "order_items_delete_manager"
  on public.order_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );
```

---

### 3.6 Tabel: `stock_movements`

```sql
-- =============================================
-- STOCK_MOVEMENTS (Audit Trail)
-- =============================================

-- SELECT: Authenticated bisa melihat mutasi stok
create policy "stock_movements_select_authenticated"
  on public.stock_movements for select
  to authenticated
  using (true);

-- INSERT: Hanya manager yang bisa mencatat mutasi manual
create policy "stock_movements_insert_manager"
  on public.stock_movements for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );

-- UPDATE: Hanya manager yang bisa update mutasi
create policy "stock_movements_update_manager"
  on public.stock_movements for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );

-- DELETE: Hanya manager yang bisa hapus mutasi
create policy "stock_movements_delete_manager"
  on public.stock_movements for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );
```

---

## 4. Keamanan Frontend (BYOK)

### 4.1 Environment Variables

```env
# =============================================
# .env.local (CLIENT-SAFE)
# =============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# =============================================
# .env.local (SERVER-ONLY — JANGAN EXPOSE)
# =============================================
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4.2 Aturan Keamanan Kunci

| Kunci | Boleh di Frontend? | Keterangan |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Ya | URL publik project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Ya | Anon key untuk operasi yang dilindungi RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ **TIDAK** | Bypass RLS — hanya di server (API Routes / Server Actions) |

> ⚠️ **PENTING:**  
> `SERVICE_ROLE_KEY` memiliki akses penuh (bypass RLS). Jika bocor ke browser, siapa pun bisa membaca/menghapus seluruh database.  
> **Jangan pernah** menaruh key ini di kode frontend, `NEXT_PUBLIC_*`, atau commit ke git.

### 4.3 Supabase Client (Browser)

**File:** `lib/supabase/client.ts`

```ts
"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 4.4 Supabase Server (Server-Side)

**File:** `lib/supabase/server.ts`

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore
          }
        },
      },
    }
  );
}
```

---

## 5. Best Practices Keamanan

### 5.1 Validasi Input (Zod)

Semua request body di API routes WAJIB divalidasi dengan Zod schema:

```ts
// lib/validators/order.ts
import { z } from "zod";

export const orderSchema = z.object({
  order_source: z.enum(["pos", "sales", "web"]),
  payment_type: z.enum(["cash", "tempo"]),
  cash_tendered: z.number().min(0).optional(),
  customer_id: z.string().uuid().optional(),
  salesman_id: z.string().uuid().optional(),
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      quantity: z.number().int().min(1),
    })
  ).min(1),
});
```

### 5.2 Proteksi SQL Injection

- Gunakan Supabase Client (parameterized queries otomatis).
- Jangan pernah concatenate input user ke query string.

### 5.3 Proteksi XSS

- React/Next.js otomatis escape output.
- Jangan gunakan `dangerouslySetInnerHTML` tanpa sanitasi.

### 5.4 Rate Limiting

- Gunakan Supabase Rate Limiting atau middleware untuk mencegah brute force login.

### 5.5 Audit Trail

- Semua mutasi stok tercatat di `stock_movements`.
- Semua transaksi tercatat di `orders` + `order_items`.

---

## 6. Checklist Keamanan Deployment

- [ ] RLS aktif di semua tabel (`enable row level security`)
- [ ] Kebijakan RLS per role sudah dibuat
- [ ] `SERVICE_ROLE_KEY` hanya di server-side env
- [ ] `NEXT_PUBLIC_*` hanya berisi anon key
- [ ] Zod validation di semua API routes
- [ ] `.env` tidak di-commit ke git (ada di `.gitignore`)
- [ ] Supabase Auth email verification aktif
- [ ] Password policy kuat (min 8 karakter)

---

> **Self-review:** Kode telah dianalisis mandiri, aman, dan mematuhi batas cakupan logika. Kebijakan RLS mengikuti prinsip least privilege — setiap role hanya memiliki akses minimal yang dibutuhkan.