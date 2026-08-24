"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah } from "@/lib/utils";
import { Package, Plus, Search } from "lucide-react";
import type { Product } from "@/types";

interface ProductForm {
  name: string;
  sku: string;
  price_buy: string;
  price_sell: string;
  stock_current: string;
  stock_min: string;
}

const emptyForm: ProductForm = {
  name: "",
  sku: "",
  price_buy: "",
  price_sell: "",
  stock_current: "",
  stock_min: "5",
};

export function ProductsView() {
  const { products, isLoading, error, refetch } = useProducts(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredProducts = search
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.sku ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : products;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validasi
    if (!form.name.trim()) {
      setFormError("Nama produk wajib diisi");
      return;
    }

    const priceBuy = Number(form.price_buy);
    const priceSell = Number(form.price_sell);
    const stockCurrent = Number(form.stock_current);
    const stockMin = Number(form.stock_min);

    if (isNaN(priceBuy) || priceBuy < 0) {
      setFormError("Harga beli tidak valid");
      return;
    }
    if (isNaN(priceSell) || priceSell < 0) {
      setFormError("Harga jual tidak valid");
      return;
    }
    if (isNaN(stockCurrent) || stockCurrent < 0) {
      setFormError("Stok tidak valid");
      return;
    }
    if (isNaN(stockMin) || stockMin < 0) {
      setFormError("Stok minimum tidak valid");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          sku: form.sku.trim() || undefined,
          price_buy: priceBuy,
          price_sell: priceSell,
          stock_current: stockCurrent,
          stock_min: stockMin,
          is_active: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.errors?.[0]?.message || "Gagal menambah produk");
      }

      // Reset form & tutup modal
      setForm(emptyForm);
      setIsModalOpen(false);
      await refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menambah produk");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Produk</h1>
          <p className="text-sm text-gray-500">Kelola inventaris & stok produk</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Daftar Produk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : isLoading ? (
            <p className="text-sm text-gray-400">Memuat produk...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-sm text-gray-400">
              {search ? "Produk tidak ditemukan." : "Belum ada produk. Klik 'Tambah Produk' untuk menambahkan."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Harga Beli</TableHead>
                  <TableHead>Harga Jual</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product: Product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-mono text-xs">{product.sku ?? "-"}</TableCell>
                    <TableCell>{formatRupiah(product.price_buy)}</TableCell>
                    <TableCell>{formatRupiah(product.price_sell)}</TableCell>
                    <TableCell>
                      <span className={product.stock_current <= product.stock_min ? "text-red-600 font-medium" : ""}>
                        {product.stock_current}
                      </span>
                      <span className="text-xs text-gray-400"> / min {product.stock_min}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? "success" : "outline"}>
                        {product.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Produk">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            name="name"
            label="Nama Produk *"
            placeholder="Contoh: Beras Premium 5kg"
            value={form.name}
            onChange={handleInputChange}
            required
          />

          <Input
            id="sku"
            name="sku"
            label="SKU"
            placeholder="Contoh: BR-5KG-001"
            value={form.sku}
            onChange={handleInputChange}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="price_buy"
              name="price_buy"
              label="Harga Beli *"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.price_buy}
              onChange={handleInputChange}
              required
            />
            <Input
              id="price_sell"
              name="price_sell"
              label="Harga Jual *"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.price_sell}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="stock_current"
              name="stock_current"
              label="Stok Awal *"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={form.stock_current}
              onChange={handleInputChange}
              required
            />
            <Input
              id="stock_min"
              name="stock_min"
              label="Stok Minimum"
              type="number"
              min="0"
              step="1"
              placeholder="5"
              value={form.stock_min}
              onChange={handleInputChange}
            />
          </div>

          {formError ? (
            <p className="text-sm text-red-600">{formError}</p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}