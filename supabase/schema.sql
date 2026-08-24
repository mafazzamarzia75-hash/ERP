-- ============================================================
-- SANVINAL MINI-ERP — SUPABASE DATABASE SCHEMA + RLS
-- ============================================================
-- Cara pakai:
--   1. Buka Supabase Dashboard > SQL Editor
--   2. Salin seluruh script ini dan jalankan (Run)
--   3. Isi .env.local dengan kredensial dari Project Settings > API
-- ============================================================

-- ============================================================
-- 1. EKSTENSI UUID
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- 2. TABEL: PROFILES (Pengguna & Role)
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text check (role in ('manager', 'salesman', 'warehouse', 'cashier')) default 'cashier',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- 3. TABEL: PRODUCTS (Inventaris & Stok)
-- ============================================================
create table if not exists public.products (
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

-- ============================================================
-- 4. TABEL: CUSTOMERS (Database Toko Langganan)
-- ============================================================
create table if not exists public.customers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  address text,
  lat decimal(10, 8),
  lng decimal(11, 8),
  credit_limit numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- 5. TABEL: ORDERS (Header Transaksi Multi-Kanal)
-- ============================================================
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.customers(id),
  salesman_id uuid references public.profiles(id),
  order_source text check (order_source in ('pos', 'sales', 'web')) default 'web',
  total_amount numeric not null,
  status text default 'pending' check (status in ('pending', 'processed', 'shipped', 'completed', 'cancelled')),
  payment_type text check (payment_type in ('cash', 'tempo')) default 'cash',
  cash_tendered numeric default 0,
  cash_change numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- 6. TABEL: ORDER_ITEMS (Detail Item Pesanan)
-- ============================================================
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity int not null,
  price_at_transaction numeric not null
);

-- ============================================================
-- 7. TABEL: STOCK_MOVEMENTS (Audit Trail Gudang)
-- ============================================================
create table if not exists public.stock_movements (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id),
  change_amount int not null,
  reason text check (reason in ('sale', 'restock', 'adjustment', 'return')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- 8. TRIGGER OTOMATIS: POTONG STOK & CATAT LOG
-- ============================================================
create or replace function public.fn_process_order_stock()
returns trigger as $$
begin
  -- Kurangi stok produk secara otomatis
  update public.products
  set stock_current = stock_current - NEW.quantity
  where id = NEW.product_id;

  -- Catat mutasi stok ke tabel audit
  insert into public.stock_movements (product_id, change_amount, reason)
  values (NEW.product_id, -NEW.quantity, 'sale');

  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_decrease_stock_on_order on public.order_items;
create trigger tr_decrease_stock_on_order
  after insert on public.order_items
  for each row
  execute function public.fn_process_order_stock();

-- ============================================================
-- 9. VIEW: VALIDASI STOK MINIMUM (Alert Restock)
-- ============================================================
-- security_invoker=true agar view mengikuti RLS tabel products
create or replace view public.vw_low_stock_products
with (security_invoker = true) as
select
  p.id,
  p.name,
  p.sku,
  p.stock_current,
  p.stock_min,
  (p.stock_current <= p.stock_min) as is_low_stock
from public.products p
where p.is_active = true
order by p.stock_current asc;

-- ============================================================
-- 10. INDEX PERFORMA
-- ============================================================
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_source on public.orders(order_source);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_stock_movements_product on public.stock_movements(product_id);
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_customers_name on public.customers(name);

-- ============================================================
-- 11. AKTIFKAN ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.stock_movements enable row level security;

-- ============================================================
-- 11b. GRANT AKSES DATA API (PostgREST)
-- ============================================================
-- Berikan akses ke role anon & authenticated untuk tabel public
grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update on public.products to authenticated;
grant select, insert, update on public.customers to authenticated;
grant select, insert, update on public.orders to authenticated;
grant select, insert, update on public.order_items to authenticated;
grant select on public.stock_movements to authenticated;
grant select on public.vw_low_stock_products to anon, authenticated;

-- ============================================================
-- 12. KEBIJAKAN RLS PER TABEL
-- ============================================================

-- ============================================================
-- 12.1 PROFILES
-- ============================================================
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_select_manager" on public.profiles;
create policy "profiles_select_manager"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );

-- ============================================================
-- 12.2 PRODUCTS
-- ============================================================
drop policy if exists "products_select_public" on public.products;
create policy "products_select_public"
  on public.products for select
  using (is_active = true);

drop policy if exists "products_select_authenticated" on public.products;
create policy "products_select_authenticated"
  on public.products for select
  to authenticated
  using (true);

drop policy if exists "products_insert_manager" on public.products;
create policy "products_insert_manager"
  on public.products for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );

drop policy if exists "products_update_manager" on public.products;
create policy "products_update_manager"
  on public.products for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );

drop policy if exists "products_delete_manager" on public.products;
create policy "products_delete_manager"
  on public.products for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );

-- ============================================================
-- 12.3 CUSTOMERS
-- ============================================================
drop policy if exists "customers_select_authenticated" on public.customers;
create policy "customers_select_authenticated"
  on public.customers for select
  to authenticated
  using (true);

drop policy if exists "customers_insert_authenticated" on public.customers;
create policy "customers_insert_authenticated"
  on public.customers for insert
  to authenticated
  with check (true);

drop policy if exists "customers_update_authenticated" on public.customers;
create policy "customers_update_authenticated"
  on public.customers for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "customers_delete_manager" on public.customers;
create policy "customers_delete_manager"
  on public.customers for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );

-- ============================================================
-- 12.4 ORDERS
-- ============================================================
drop policy if exists "orders_insert_public" on public.orders;
create policy "orders_insert_public"
  on public.orders for insert
  to anon
  with check (order_source = 'web');

drop policy if exists "orders_insert_authenticated" on public.orders;
create policy "orders_insert_authenticated"
  on public.orders for insert
  to authenticated
  with check (true);

drop policy if exists "orders_select_authenticated" on public.orders;
create policy "orders_select_authenticated"
  on public.orders for select
  to authenticated
  using (true);

drop policy if exists "orders_update_authenticated" on public.orders;
create policy "orders_update_authenticated"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "orders_delete_manager" on public.orders;
create policy "orders_delete_manager"
  on public.orders for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );

-- ============================================================
-- 12.5 ORDER_ITEMS
-- ============================================================
drop policy if exists "order_items_insert_public" on public.order_items;
create policy "order_items_insert_public"
  on public.order_items for insert
  to anon
  with check (true);

drop policy if exists "order_items_insert_authenticated" on public.order_items;
create policy "order_items_insert_authenticated"
  on public.order_items for insert
  to authenticated
  with check (true);

drop policy if exists "order_items_select_authenticated" on public.order_items;
create policy "order_items_select_authenticated"
  on public.order_items for select
  to authenticated
  using (true);

drop policy if exists "order_items_update_authenticated" on public.order_items;
create policy "order_items_update_authenticated"
  on public.order_items for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "order_items_delete_manager" on public.order_items;
create policy "order_items_delete_manager"
  on public.order_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );

-- ============================================================
-- 12.6 STOCK_MOVEMENTS (Audit Trail)
-- ============================================================
drop policy if exists "stock_movements_select_authenticated" on public.stock_movements;
create policy "stock_movements_select_authenticated"
  on public.stock_movements for select
  to authenticated
  using (true);

drop policy if exists "stock_movements_insert_manager" on public.stock_movements;
create policy "stock_movements_insert_manager"
  on public.stock_movements for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );

drop policy if exists "stock_movements_update_manager" on public.stock_movements;
create policy "stock_movements_update_manager"
  on public.stock_movements for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );

drop policy if exists "stock_movements_delete_manager" on public.stock_movements;
create policy "stock_movements_delete_manager"
  on public.stock_movements for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );

-- ============================================================
-- 13. TRIGGER: BUAT PROFILES OTOMATIS SAAT USER REGISTRASI
-- ============================================================
-- SECURITY DEFINER diperlukan karena trigger berjalan di schema auth
-- dan harus bisa insert ke public.profiles tanpa RLS
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'cashier');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================
-- SELESAI — SCHEMA & RLS BERHASIL DIBUAT
-- ============================================================