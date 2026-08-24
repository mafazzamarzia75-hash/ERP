# 🏪 Sanvinal Mini-ERP — Full-Stack Blueprint

> **Arsitektur Modular** · Next.js + TypeScript + Tailwind CSS + Supabase (PostgreSQL) · Deploy Vercel

Sistem Mini-ERP berbasis web yang integrasikan **etalase publik**, **POS toko fisik**, **tenaga sales lapangan**, **gudang**, dan **dasbor manajer** dalam satu arsitektur ringan, modular, dan aman (BYOK + RLS).

---

## 📂 Struktur Folder Modular

```
modern-full-stack-web-app-erp/
├── app/                          # Next.js App Router (Pages & API)
│   ├── layout.tsx                # Root Layout (Navbar + Footer)
│   ├── page.tsx                  # Homepage / Landing
│   ├── (store)/page.tsx          # Etalase Publik (Katalog)
│   ├── (pos)/page.tsx            # POS Kasir Toko
│   ├── (sales)/page.tsx          # Salesman Mobile-First
│   ├── (warehouse)/page.tsx      # Gudang / Stok
│   ├── (dashboard)/page.tsx      # Dasbor Manajer
│   └── api/                      # Serverless API Routes
│       ├── products/route.ts
│       ├── orders/route.ts
│       ├── customers/route.ts
│       └── stock-movements/route.ts
├── components/                   # Reusable UI Components
│   ├── ui/                       # Primitives (Button, Input, Badge...)
│   ├── product/                  # ProductCard, StockBadge
│   ├── order/                    # OrderSummary, PaymentPanel
│   └── layout/                   # Navbar, Sidebar, Footer
├── views/                        # Page-Level Views (Composition)
│   ├── store/                    # StorefrontView
│   ├── pos/                      # PosView
│   ├── sales/                    # SalesView
│   ├── warehouse/                # WarehouseView
│   └── dashboard/                # DashboardView
├── hooks/                        # Custom Hooks (Data & Logic)
│   ├── useAuth.ts
│   ├── useProducts.ts
│   ├── useOrders.ts
│   ├── useCustomers.ts
│   ├── useCart.ts
│   ├── useStockMovements.ts
│   └── useGeolocation.ts
├── types/                        # TypeScript Types (Strict)
│   ├── index.ts                  # Core Types & Enums
│   └── api.ts                    # API Request/Response Types
├── lib/                          # Utility & Service Layer
│   ├── supabase/
│   │   ├── client.ts             # Supabase Client (Anon Key)
│   │   └── server.ts             # Supabase Server Client
│   ├── validators/               # Zod Schemas
│   │   ├── order.ts
│   │   └── product.ts
│   └── constants.ts              # App Constants
├── server/                       # Backend Business Logic
│   ├── order-service.ts          # Order Validation & Creation
│   ├── stock-service.ts          # Stock Movement Logic
│   └── dashboard-service.ts      # Aggregation Queries
├── .env.example                  # Environment Template
├── package.json                  # Dependencies
└── README.md                     # This File
```

---

## 🧩 Modul Fungsional

| Modul | Route | Target Device | Fitur Key |
| :--- | :--- | :--- | :--- |
| **Etalase Publik** | `/store` | Desktop/Mobile | Katalog produk, checkout cash-only |
| **POS Kasir** | `/pos` | Desktop (Toko) | Transaksi OTC, kembalian auto, nota thermal |
| **Salesman** | `/sales` | Mobile-First | Pesanan lapangan, tempo/utang, geotagging |
| **Gudang** | `/warehouse` | Desktop | Stok real-time, status pesanan pipeline |
| **Dasbor Manajer** | `/dashboard` | Desktop | Omset, piutang, rekapitulasi lintas kanal |

---

## 🔐 Arsitektur Keamanan

- **BYOK (Bring Your Own Key)**: Klient hanya menggunakan `SUPABASE_ANON_KEY`. `SERVICE_ROLE_KEY` dilarang keras dimuat ke frontend.
- **RLS (Row Level Security)**: Kebijak akses enforced at database level (see `docs/08-security-rls.md`).
- **Validasi Ketat**: Zod schemas at API boundary + business rules at service layer.

---

## 🚀 Quick Start

```bash
# 1. Clone repository
git clone <repo-url>

# 2. Salin environment template
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Jalankan development server
npm run dev
```

> **Database Setup**: Jalankan skript SQL dari `docs/01-database-schema.md` pada Supabase SQL Editor.

---

## 📚 Dokumentasi Modul

| File | Kontenido |
| :--- | :--- |
| `docs/01-database-schema.md` | Full Supabase SQL (tables, triggers, RLS) |
| `docs/02-types.md` | TypeScript types & enums |
| `docs/03-components.md` | Reusable UI components |
| `docs/04-hooks.md` | Custom hooks (data & logic) |
| `docs/05-views.md` | Page-level views per modul |
| `docs/06-api-routes.md` | Serverless API routes |
| `docs/07-backend-logic.md` | Service layer & business rules |
| `docs/08-security-rls.md` | RLS policies & security best practices |
| `docs/09-setup-guide.md` | Setup & deployment guide |

---

## 📄 License

Proprietary — Sanvinal Mini-ERP. All rights reserved.