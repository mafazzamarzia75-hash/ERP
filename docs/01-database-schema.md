# Database Schema — Sanvinal Mini-ERP

> **Teknologi:** PostgreSQL via Supabase (BaaS)  
> **Cara pakai:** Salin seluruh script SQL di bawah ke Supabase SQL Editor, lalu eksekusi.

---

## 1. Ekstensi UUID

```sql
-- Aktifkan ekstensi UUID
create extension if not exists "uuid-ossp";
```

---

## 2. Tabel: Profiles (Pengguna & Role)

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text check (role in ('manager', 'salesman', 'warehouse', 'cashier')) default 'cashier',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

| Kolom | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | `uuid` | PK, relasi 1-ke-1 ke `auth.users` |
| `full_name` | `text` | Nama lengkap pengguna |
| `role` | `text` | `manager` / `salesman` / `warehouse` / `cashier` |
| `created_at` | `timestamptz` | Auto timestamp UTC |

---

## 3. Tabel: products (Inventaris & Stok)

```sql
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  sku text unique,
  price_buy numeric default 0,
  price_sell numeric default 0,
  stock_current int default 0,
  stock_min int default 5,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

| Kolom | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | uuid | Primary key |
| `name` | text | Nama produk |
| `sku` | text | SKU unik |
| `price_buy` | numeric | Harga beli |
| `price_sell` | numeric | Harga jual |
| `stock_current` | int | Stok saat ini |
| `stock_min` | int | Ambang stok minimum (default 5) |
| `is_active` | boolean | Produk aktif/tidak untuk etalase |
| `created_at` | timestamptz | Auto timestamp UTC |

---

## 4. Tabel: customers (Database Toko Langganan)

```sql
create table if not exists customers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  address text,
  lat decimal(10, 8),
  lng decimal(11, 8),
  credit_limit numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

| Kolom | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | uuid | Primary key |
| `name` | text | Nama toko/pelanggan |
| `address` | text | Alamat |
| `lat` | decimal(10,8) | Titik koordinat latitude (geotagging) |
| `lng` | decimal(11,8) | Titik koordinat longitude (geotagging) |
| `credit_limit` | numeric | Plafon utang tempo |
| `created_at` | timestamptz | Auto timestamp |

---

## 5. Tabel: orders (Header Transaksi Multi-Kanal)

```sql
create table if not exists orders (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references customers(id),
  salesman_id uuid references profiles(id),
  order_source text check (order_source in ('pos', 'sales', 'web')) default 'web',
  total_amount numeric not null,
  status text default 'pending' check (status in ('pending', 'processed', 'shipped', 'completed', 'cancelled')),
  payment_type text check (payment_type in ('cash', 'tempo')) default 'cash',
  cash_tendered numeric default 0,
  cash_change numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

| Kolom | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | uuid | Primary key |
| `customer_id` | uuid | Relasi ke `customers` |
| `salesman_id` | uuid | Relasi ke `profiles` (salesman) |
| `order_source` | text | `pos` / `sales` / `web` |
| `total_amount` | numeric | Total transaksi |
| `status` | text | `pending` → `processed` → `shipped` → `completed` / `cancelled` |
| `payment_type` | text | `cash` (lunas) / `tempo` (utang) |
| `cash_tendered` | numeric | Uang yang dibayarkan |
| `cash_change` | numeric | Kembalian |
| `created_at` | timestamptz | Auto timestamp |

---

## 6. Tabel: order_items (Detail Item Pesanan)

```sql
create table if not exists order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity int not null,
  price_at_transaction numeric not null
);
```

| Kolom | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | uuid | Primary key |
| `order_id` | uuid | Relasi ke `orders`, cascade on delete |
| `product_id` | uuid | Relasi ke `products` |
| `quantity` | int | Jumlah item |
| `price_at_transaction` | numeric | Harga snapshot saat transaksi |

---

## 7. Tabel: stock_movements (Audit Trail Gudang)

```sql
create table if not exists stock_movements (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id),
  change_amount int not null,
  reason text check (reason in ('sale', 'restock', 'adjustment', 'return')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

| Kolom | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | uuid | Primary key |
| `product_id` | uuid | Relasi ke `products` |
| `change_amount` | int | Perubahan stok (negatif = berkurang) |
| `reason` | text | `sale` / `restock` / `adjustment` / `return` |
| `created_at` | timestamptz | Auto timestamp |

---

## 8. Trigger Otomatis: Potong Stok & Catat Log

```sql
-- ==========================================
-- FUNGSI TRIGGER
-- ==========================================
create or replace function fn_process_order_stock()
returns trigger as $$
begin
  -- Kurangi stok produk secara otomatis
  update products
  set stock_current = stock_current - NEW.quantity
  where id = NEW.product_id;

  -- Catat mutasi stok ke tabel audit
  insert into stock_movements (product_id, change_amount, reason)
  values (NEW.product_id, -NEW.quantity, 'sale');

  return NEW;
end;
$$ language plpgsql security definer;

-- ==========================================
-- TRIGGER PADA order_items
-- ==========================================
create trigger tr_decrease_stock_on_order
  after insert on order_items
  for each row
  execute function fn_process_order_stock();
```

**Cara kerja trigger:**

1. Setiap baris baru di-insert ke `order_items` (misalnya via POS/Web/Salesman)
2. Fungsi `fn_process_order_stock()` otomatis mengeksekusi:
   - `products.stock_current` dikurangi sejumlah `quantity`
   - Satu baris audit dicatat ke `stock_movements` dengan reason `'sale'`

> **Catatan:** Trigger menggunakan `security definer` agar stok tetap terpotong meskipun role pengguna terbatas oleh RLS.

---

## 9. Validasi Stok Minimum (Optional — Alert Restock)

```sql
-- Produk yang stoknya di bawah ambang minimum
create or replace view vw_low_stock_products as
select
  p.id,
  p.name,
  p.sku,
  p.stock_current,
  p.stock_min,
  (p.stock_current <= p.stock_min) as is_low_stock
from products p
where p.is_active = true
order by p.stock_current asc;
```

---

## 10. Index Performa (Opsional)

```sql
-- Index untuk mempercepat pencarian
create index if not exists idx_orders_customer on orders(customer_id);
create index if not exists idx_orders_source on orders(order_source);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_stock_movements_product on stock_movements(product_id);
create index if not exists idx_products_active on products(is_active);
create index if not exists idx_customers_name on customers(name);
```

---

## 11. Catatan Deployment

| Langkah | Aksi |
| :--- | :--- |
| 1 | Jalankan seluruh SQL di atas pada Supabase SQL Editor |
| 2 | Copy `docs/08-security-rls.md` dan jalankan untuk mengaktifkan Row Level Security |
| 3 | Isi `.env` dengan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| 4 | Login ke Supabase Dashboard > Authentication > enable Email provider |

> ⚠️ **PENTING — Keamanan:**  
> Jangan pernah memasukkan `SUPABASE_SERVICE_ROLE_KEY` ke kode frontend/browser.  
> Kunci tersebut hanya boleh berada di sisi server (Next.js Server Actions / API Routes).