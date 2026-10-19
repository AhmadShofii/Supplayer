import React, { useMemo, useState } from 'react';
import {
  Boxes,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
  X,
  History,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDateTime, formatNumber, formatRupiah } from '../lib/formatters';
import { MovementType, Product, ReferenceType } from '../types';

export const InventoryView: React.FC = () => {
  const { products, movements, addStockMovement, currentUser, categories } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'stocks' | 'movements'>('stocks');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockConditionFilter, setStockConditionFilter] = useState<'all' | 'critical' | 'safe'>('all');
  const [movementTypeFilter, setMovementTypeFilter] = useState<'all' | 'in' | 'out' | 'adjustment'>('all');

  // Mutation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mutationData, setMutationData] = useState({
    productId: products[0]?.id || '',
    type: 'in' as MovementType,
    quantity: 1,
    notes: '',
    referenceType: 'manual' as ReferenceType,
    referenceId: '',
  });

  const canMutate = ['super_admin', 'admin', 'gudang'].includes(currentUser?.role || '');

  // Filtered products for stock list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const isCritical = p.currentStock <= p.minStock;
      const matchCondition =
        stockConditionFilter === 'all' ||
        (stockConditionFilter === 'critical' && isCritical) ||
        (stockConditionFilter === 'safe' && !isCritical);

      return matchSearch && matchCondition;
    });
  }, [products, searchQuery, stockConditionFilter]);

  // Filtered movements for history list
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const prod = products.find((p) => p.id === m.productId);
      const matchSearch =
        (prod?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod?.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.referenceId || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = movementTypeFilter === 'all' || m.type === movementTypeFilter;
      return matchSearch && matchType;
    });
  }, [movements, products, searchQuery, movementTypeFilter]);

  const openMutationModal = (product?: Product, defaultType?: MovementType) => {
    setMutationData({
      productId: product?.id || products[0]?.id || '',
      type: defaultType || 'in',
      quantity: 1,
      notes: '',
      referenceType: 'manual',
      referenceId: '',
    });
    setIsModalOpen(true);
  };

  const handleMutationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mutationData.productId || mutationData.quantity <= 0) return;

    const res = addStockMovement({
      productId: mutationData.productId,
      type: mutationData.type,
      quantity: mutationData.quantity,
      notes: mutationData.notes || (mutationData.type === 'in' ? 'Stok masuk gudang' : 'Stok keluar'),
      referenceType: mutationData.referenceType,
      referenceId: mutationData.referenceId || undefined,
    });

    if (res.success) {
      setIsModalOpen(false);
    }
  };

  const selectedProdForModal = products.find((p) => p.id === mutationData.productId);

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Action Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Sub-tabs: Saldo Stok vs Riwayat Mutasi */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs self-start">
          <button
            onClick={() => setActiveSubTab('stocks')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-semibold transition-colors ${
              activeSubTab === 'stocks'
                ? 'bg-white text-[#23374D] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-4 h-4 text-[#526D82]" />
            <span>Ketersediaan Stok ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('movements')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-semibold transition-colors ${
              activeSubTab === 'movements'
                ? 'bg-white text-[#23374D] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-[#526D82]" />
            <span>Riwayat Mutasi ({movements.length})</span>
          </button>
        </div>

        {/* Action Button: Catat Mutasi Persediaan */}
        {canMutate && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openMutationModal(undefined, 'in')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Stok Masuk</span>
            </button>
            <button
              onClick={() => openMutationModal(undefined, 'out')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors shadow-xs"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Stok Keluar</span>
            </button>
          </div>
        )}
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeSubTab === 'stocks'
                ? 'Cari nama produk atau SKU...'
                : 'Cari catatan mutasi, referensi, atau SKU...'
            }
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
          />
        </div>

        {activeSubTab === 'stocks' ? (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Status:</span>
            <button
              onClick={() => setStockConditionFilter('all')}
              className={`px-3 py-1 rounded-md font-medium text-xs border ${
                stockConditionFilter === 'all'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setStockConditionFilter('critical')}
              className={`px-3 py-1 rounded-md font-medium text-xs border ${
                stockConditionFilter === 'critical'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-rose-700 border-rose-200'
              }`}
            >
              Kritis / Menipis
            </button>
            <button
              onClick={() => setStockConditionFilter('safe')}
              className={`px-3 py-1 rounded-md font-medium text-xs border ${
                stockConditionFilter === 'safe'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white text-emerald-800 border-emerald-200'
              }`}
            >
              Stok Aman
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Tipe Mutasi:</span>
            {(['all', 'in', 'out', 'adjustment'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setMovementTypeFilter(t)}
                className={`px-3 py-1 rounded-md font-medium text-xs border capitalize ${
                  movementTypeFilter === t
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {t === 'all' ? 'Semua' : t === 'in' ? 'Masuk' : t === 'out' ? 'Keluar' : 'Koreksi'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* VIEW 1: SALDO STOK PER PRODUK */}
      {activeSubTab === 'stocks' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Nama Produk</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3 text-right">Stok Fisik Saat Ini</th>
                  <th className="px-4 py-3 text-right">Batas Min. Aman</th>
                  <th className="px-4 py-3">Indikator Stok</th>
                  <th className="px-4 py-3 text-right">Estimasi Aset</th>
                  {canMutate && <th className="px-4 py-3 text-right">Aksi Cepat</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#27313B]">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                      Tidak ada data stok yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const category = categories.find((c) => c.id === p.categoryId);
                    const isLow = p.currentStock <= p.minStock;
                    const isZero = p.currentStock === 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-[#23374D]">
                          {p.sku}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {p.name}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                          {category?.name || '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-sm">
                          <span className={isLow ? 'text-rose-600' : 'text-slate-900'}>
                            {formatNumber(p.currentStock)} {p.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-500">
                          {formatNumber(p.minStock)} {p.unit}
                        </td>
                        <td className="px-4 py-3">
                          {isZero ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3" />
                              Kosong (0 {p.unit})
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3" />
                              Menipis (Perlu Reorder)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                              <CheckCircle className="w-3 h-3" />
                              Aman
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-medium text-slate-800">
                          {formatRupiah(p.currentStock * p.buyPrice)}
                        </td>
                        {canMutate && (
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => openMutationModal(p, 'in')}
                                className="px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200"
                                title="Catat barang masuk"
                              >
                                + Masuk
                              </button>
                              <button
                                onClick={() => openMutationModal(p, 'out')}
                                className="px-2 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200"
                                title="Catat barang keluar"
                              >
                                - Keluar
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: RIWAYAT MUTASI BARANG */}
      {activeSubTab === 'movements' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">Waktu & Tanggal</th>
                  <th className="px-4 py-3">Produk & SKU</th>
                  <th className="px-4 py-3">Jenis Mutasi</th>
                  <th className="px-4 py-3 text-right">Jumlah Unit</th>
                  <th className="px-4 py-3 text-right">Stok Sebelum & Sesudah</th>
                  <th className="px-4 py-3">Referensi / No. PO</th>
                  <th className="px-4 py-3">Catatan / Alasan</th>
                  <th className="px-4 py-3 text-right">Petugas Gudang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#27313B]">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                      Belum ada mutasi persediaan yang dicatat.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((m) => {
                    const prod = products.find((p) => p.id === m.productId);
                    const isIn = m.type === 'in';
                    const isOut = m.type === 'out';

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                          {formatDateTime(m.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-800 block">
                            {prod?.name || 'Produk'}
                          </span>
                          <span className="font-mono text-slate-400 text-[10px]">
                            {prod?.sku || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isIn ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                              <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                              Stok Masuk
                            </span>
                          ) : isOut ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded">
                              <ArrowUpRight className="w-3 h-3 text-rose-600" />
                              Stok Keluar
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-300 px-2 py-0.5 rounded">
                              <RefreshCw className="w-3 h-3 text-blue-600" />
                              Koreksi Opname
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-sm">
                          <span className={isIn ? 'text-emerald-700' : 'text-rose-700'}>
                            {isIn ? '+' : isOut ? '-' : ''}
                            {formatNumber(m.quantity)} {prod?.unit || 'unit'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[11px] text-slate-600">
                          {m.stockBefore} ➔ <strong className="text-slate-900 font-bold">{m.stockAfter}</strong>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-[#23374D] font-semibold">
                          {m.referenceId || '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={m.notes}>
                          {m.notes}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500 text-[11px] whitespace-nowrap">
                          {m.createdBy}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Mutation Modal (Stok Masuk, Stok Keluar, Koreksi) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-[#23374D] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-[#8FA99B]" />
                <h3 className="text-sm font-bold tracking-tight">Catat Mutasi Persediaan</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMutationSubmit} className="p-6 space-y-4 text-xs">
              {/* Product Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Pilih Produk <span className="text-rose-500">*</span>
                </label>
                <select
                  value={mutationData.productId}
                  onChange={(e) => setMutationData({ ...mutationData, productId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — Stok: {p.currentStock} {p.unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mutation Type Radio Buttons */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Jenis Mutasi Barang <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMutationData({ ...mutationData, type: 'in' })}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      mutationData.type === 'in'
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Masuk</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMutationData({ ...mutationData, type: 'out' })}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      mutationData.type === 'out'
                        ? 'bg-rose-700 text-white border-rose-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Keluar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMutationData({ ...mutationData, type: 'adjustment' })}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      mutationData.type === 'adjustment'
                        ? 'bg-blue-700 text-white border-blue-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Koreksi</span>
                  </button>
                </div>
              </div>

              {/* Current stock preview & validation warning */}
              {selectedProdForModal && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Stok Gudang Terdata:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {selectedProdForModal.currentStock} {selectedProdForModal.unit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-[11px] block">Estimasi Stok Akhir:</span>
                    <span
                      className={`font-mono font-bold text-sm ${
                        mutationData.type === 'out' && selectedProdForModal.currentStock - mutationData.quantity < 0
                          ? 'text-rose-600'
                          : 'text-[#23374D]'
                      }`}
                    >
                      {mutationData.type === 'in'
                        ? selectedProdForModal.currentStock + mutationData.quantity
                        : mutationData.type === 'out'
                        ? selectedProdForModal.currentStock - mutationData.quantity
                        : mutationData.quantity}{' '}
                      {selectedProdForModal.unit}
                    </span>
                  </div>
                </div>
              )}

              {/* Strict negative stock alert warning */}
              {selectedProdForModal &&
                mutationData.type === 'out' &&
                selectedProdForModal.currentStock - mutationData.quantity < 0 && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <p className="text-[11px] leading-relaxed">
                      <strong>Validasi Sesuai PRD:</strong> Stok tidak boleh bernilai negatif! Jumlah keluar melebihi stok yang tersedia saat ini.
                    </p>
                  </div>
                )}

              {/* Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    {mutationData.type === 'adjustment' ? 'Stok Fisik Baru' : 'Jumlah Barang'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={mutationData.quantity}
                    onChange={(e) => setMutationData({ ...mutationData, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    No. Ref / Surat Jalan
                  </label>
                  <input
                    type="text"
                    value={mutationData.referenceId}
                    onChange={(e) => setMutationData({ ...mutationData, referenceId: e.target.value })}
                    placeholder="Contoh: SJ-2026/10/88"
                    className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Catatan / Keterangan Mutasi <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={mutationData.notes}
                  onChange={(e) => setMutationData({ ...mutationData, notes: e.target.value })}
                  placeholder="Kebutuhan produksi divisi perakitan, retur reject, atau hasil opname fisik..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={
                    selectedProdForModal &&
                    mutationData.type === 'out' &&
                    selectedProdForModal.currentStock - mutationData.quantity < 0
                  }
                  className="px-4 py-2 font-semibold text-white bg-[#23374D] hover:bg-[#1a293a] rounded-lg shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Simpan Transaksi Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
