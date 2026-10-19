import React, { useMemo, useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Archive,
  Layers,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  X,
  Boxes,
  Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatNumber, formatRupiah } from '../lib/formatters';
import { Product } from '../types';

export const ProductView: React.FC = () => {
  const {
    products,
    categories,
    suppliers,
    addProduct,
    updateProduct,
    archiveProduct,
    deleteProduct,
    addCategory,
    currentUser,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Category State
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    categoryId: categories[0]?.id || '',
    supplierId: suppliers[0]?.id || '',
    buyPrice: 0,
    minStock: 10,
    currentStock: 0,
    unit: 'Pcs',
    description: '',
    status: 'active' as 'active' | 'archived',
  });

  const canEdit = ['super_admin', 'admin'].includes(currentUser?.role || '');

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      sku: `PRD-${Date.now().toString().slice(-4)}`,
      name: '',
      categoryId: categories[0]?.id || '',
      supplierId: suppliers[0]?.id || '',
      buyPrice: 50000,
      minStock: 10,
      currentStock: 0,
      unit: 'Pcs',
      description: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      sku: prod.sku,
      name: prod.name,
      categoryId: prod.categoryId,
      supplierId: prod.supplierId,
      buyPrice: prod.buyPrice,
      minStock: prod.minStock,
      currentStock: prod.currentStock,
      unit: prod.unit,
      description: prod.description,
      status: prod.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim() || formData.buyPrice <= 0) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setIsModalOpen(false);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatCode.trim()) return;
    addCategory({
      code: newCatCode.toUpperCase(),
      name: newCatName,
      description: newCatDesc,
    });
    setNewCatCode('');
    setNewCatName('');
    setNewCatDesc('');
    setIsCategoryModalOpen(false);
  };

  const handleDeleteProduct = (prod: Product) => {
    if (window.confirm(`Hapus atau arsipkan produk "${prod.name}" (${prod.sku})?`)) {
      deleteProduct(prod.id);
      if (selectedProduct?.id === prod.id) {
        setSelectedProduct(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search SKU / Name */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama produk atau SKU..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D] focus:border-[#23374D]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
          >
            <option value="all">Semua Kategori ({products.length})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.code})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs shrink-0">
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'active'
                  ? 'bg-white text-[#23374D] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setStatusFilter('archived')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'archived'
                  ? 'bg-white text-slate-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Arsip
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
          </div>
        </div>

        {/* Buttons: Add Product & Manage Categories */}
        <div className="flex items-center gap-2 shrink-0">
          {canEdit && (
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#23374D] bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
              title="Kelola kategori produk"
            >
              <Layers className="w-3.5 h-3.5 text-[#526D82]" />
              <span>Kategori</span>
            </button>
          )}

          {canEdit && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#23374D] hover:bg-[#1a293a] rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">SKU & Kode</th>
                <th className="px-4 py-3">Nama Produk</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Supplier Utama</th>
                <th className="px-4 py-3 text-right">Harga Beli</th>
                <th className="px-4 py-3 text-right">Stok Gudang</th>
                <th className="px-4 py-3">Kondisi Stok</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#27313B]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium text-slate-600">Tidak ada produk ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau kategori.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const category = categories.find((c) => c.id === prod.categoryId);
                  const supplier = suppliers.find((s) => s.id === prod.supplierId);
                  const isLowStock = prod.currentStock <= prod.minStock;
                  const isOutOfStock = prod.currentStock === 0;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-[#23374D]">
                        {prod.sku}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedProduct(prod)}
                          className="text-left font-semibold text-slate-800 hover:text-[#23374D] hover:underline"
                        >
                          {prod.name}
                        </button>
                        <span className="text-[11px] text-slate-400 block line-clamp-1">
                          {prod.description}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-600 font-medium text-[11px]">
                          {category?.name || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[140px] text-[11px]">{supplier?.name || '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-slate-900">
                        {formatRupiah(prod.buyPrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold">
                        <span className={isLowStock ? 'text-rose-600' : 'text-slate-800'}>
                          {formatNumber(prod.currentStock)} {prod.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            Habis
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            Menipis (Min: {prod.minStock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                            <CheckCircle className="w-3 h-3" />
                            Aman
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setSelectedProduct(prod)}
                            className="px-2 py-1 text-slate-600 hover:text-[#23374D] hover:bg-slate-100 rounded text-xs"
                          >
                            Detail
                          </button>
                          {canEdit && (
                            <>
                              <button
                                onClick={() => openEditModal(prod)}
                                className="p-1.5 text-slate-500 hover:text-[#23374D] hover:bg-slate-100 rounded"
                                title="Edit Produk"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => archiveProduct(prod.id)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                                title={prod.status === 'active' ? 'Arsipkan' : 'Aktifkan Kembali'}
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                                title="Hapus Produk"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-[#23374D] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#8FA99B]" />
                <h3 className="text-sm font-bold tracking-tight">
                  {editingProduct ? 'Ubah Informasi Produk' : 'Tambah Produk Baru ke Katalog'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Kode SKU <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    placeholder="Contoh: BBL-SP-01"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Satuan Unit <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Pcs, Kg, Lembar, Drum, Batang..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama deskriptif barang"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Kategori Produk
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Supplier Utama
                  </label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.status === 'inactive' ? '(Nonaktif)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Harga Beli (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({ ...formData, buyPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Batas Min. Stok <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    {editingProduct ? 'Stok Terdata' : 'Stok Awal'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={!!editingProduct}
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D] disabled:opacity-60 disabled:cursor-not-allowed"
                    title={editingProduct ? 'Perubahan stok dilakukan melalui Modul Persediaan / Mutasi' : ''}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Deskripsi / Spesifikasi Teknis
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Spesifikasi ukuran, standar QC, atau instruksi penyimpanan..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#23374D] hover:bg-[#1a293a] rounded-lg shadow-xs"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Tambahkan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-[#23374D] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#8FA99B]" />
                <h3 className="text-sm font-bold tracking-tight">Kategori Produk</h3>
              </div>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-300 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Existing categories */}
              <div>
                <span className="font-semibold text-slate-700 uppercase tracking-wider block mb-2">
                  Daftar Kategori Saat Ini ({categories.length})
                </span>
                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                  {categories.map((c) => {
                    const count = products.filter((p) => p.categoryId === c.id).length;
                    return (
                      <div key={c.id} className="p-2.5 flex items-center justify-between bg-slate-50/50">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#23374D]">{c.code}</span>
                            <span className="font-semibold text-slate-800">{c.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{c.description}</p>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                          {count} produk
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add category form */}
              <form onSubmit={handleAddCategorySubmit} className="pt-4 border-t border-slate-200 space-y-3">
                <span className="font-semibold text-slate-700 uppercase tracking-wider block">
                  Tambah Kategori Baru
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Kode (3 Huruf)</label>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      value={newCatCode}
                      onChange={(e) => setNewCatCode(e.target.value.toUpperCase())}
                      placeholder="MIS"
                      className="w-full px-2.5 py-1.5 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] text-slate-500 mb-1">Nama Kategori</label>
                    <input
                      type="text"
                      required
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Contoh: Alat Keselamatan Kerja"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Deskripsi Singkat</label>
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Keterangan cakupan barang..."
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-3 py-1.5 text-slate-600 bg-slate-100 rounded-lg"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-white bg-[#23374D] hover:bg-[#1a293a] rounded-lg font-semibold"
                  >
                    Simpan Kategori
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden text-xs">
            <div className="bg-[#23374D] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#8FA99B] font-mono">{selectedProduct.sku}</span>
                <h3 className="text-base font-bold tracking-tight">{selectedProduct.name}</h3>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-slate-300 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Kategori</span>
                  <span className="font-semibold text-slate-800">
                    {categories.find((c) => c.id === selectedProduct.categoryId)?.name || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Harga Beli Standar</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatRupiah(selectedProduct.buyPrice)} / {selectedProduct.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Stok Gudang</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {formatNumber(selectedProduct.currentStock)} {selectedProduct.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Batas Aman Minimum</span>
                  <span className="font-mono text-slate-600">
                    {formatNumber(selectedProduct.minStock)} {selectedProduct.unit}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Supplier Mitra</span>
                  <span className="font-semibold text-[#23374D]">
                    {suppliers.find((s) => s.id === selectedProduct.supplierId)?.name || '-'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Deskripsi</span>
                  <p className="text-slate-600 leading-relaxed">{selectedProduct.description || 'Tidak ada deskripsi.'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setActiveTab('inventory');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-[#526D82] hover:text-[#23374D] font-semibold"
                >
                  <Boxes className="w-3.5 h-3.5" />
                  <span>Lihat Mutasi di Modul Persediaan</span>
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
