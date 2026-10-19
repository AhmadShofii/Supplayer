import React, { useMemo } from 'react';
import {
  Building2,
  Package,
  Boxes,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  CheckCircle,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, formatNumber, formatRupiah, getPOStatusColor, getPOStatusLabel } from '../lib/formatters';

export const DashboardView: React.FC = () => {
  const { suppliers, products, purchaseOrders, movements, setActiveTab, currentUser } = useApp();

  // Metrics computation
  const activeSuppliersCount = useMemo(
    () => suppliers.filter((s) => s.status === 'active').length,
    [suppliers]
  );

  const activeProductsCount = useMemo(
    () => products.filter((p) => p.status === 'active').length,
    [products]
  );

  const totalStockUnits = useMemo(
    () => products.reduce((acc, p) => acc + (p.status === 'active' ? p.currentStock : 0), 0),
    [products]
  );

  const totalStockValuation = useMemo(
    () =>
      products.reduce(
        (acc, p) => acc + (p.status === 'active' ? p.currentStock * p.buyPrice : 0),
        0
      ),
    [products]
  );

  // Month-to-date calculation (e.g. October 2026)
  const currentMonthPOs = useMemo(() => {
    return purchaseOrders.filter((po) => po.orderDate.startsWith('2026-10'));
  }, [purchaseOrders]);

  const currentMonthValue = useMemo(() => {
    return currentMonthPOs.reduce((acc, po) => acc + po.totalAmount, 0);
  }, [currentMonthPOs]);

  const totalPurchasesValue = useMemo(() => {
    return purchaseOrders
      .filter((po) => po.status !== 'cancelled')
      .reduce((acc, po) => acc + po.totalAmount, 0);
  }, [purchaseOrders]);

  // Low Stock Items (stok rendah: currentStock <= minStock)
  const lowStockProducts = useMemo(() => {
    return products
      .filter((p) => p.status === 'active' && p.currentStock <= p.minStock)
      .sort((a, b) => a.currentStock / a.minStock - b.currentStock / b.minStock);
  }, [products]);

  // Recent POs
  const recentOrders = useMemo(() => {
    return [...purchaseOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [purchaseOrders]);

  // Monthly purchasing trend data (simulation over recent months)
  const monthlyTrends = [
    { month: 'Jun', amount: 32400000, height: 45 },
    { month: 'Jul', amount: 48500000, height: 65 },
    { month: 'Agt', amount: 41200000, height: 55 },
    { month: 'Sep', amount: 56900000, height: 75 },
    { month: 'Okt', amount: currentMonthValue || 72954750, height: 95 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#526D82] uppercase tracking-wider mb-1">
            <span>Sistem Informasi Manajemen Supplier</span>
            <span aria-hidden="true">·</span>
            <span>PT Supplier</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#23374D] tracking-tight">
            Selamat datang, {currentUser?.name || 'Administrator'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Pantau status ketersediaan barang pabrik, riwayat pesanan pengadaan, performa vendor mitra, dan pergerakan stok harian.
          </p>
        </div>

        {/* Quick action buttons according to permissions */}
        {['super_admin', 'admin', 'purchasing'].includes(currentUser?.role || '') && (
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('orders')}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#23374D] hover:bg-[#1a293a] rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Buat PO Baru</span>
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#23374D] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              <Boxes className="w-4 h-4" />
              <span>Mutasi Stok</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Supplier Aktif */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Supplier Aktif
            </span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-[#23374D]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#23374D] font-mono tabular-nums">
              {activeSuppliersCount}
            </span>
            <span className="text-xs text-slate-500">mitra terverifikasi</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <span>Total terdaftar:</span>
            <span className="font-semibold text-slate-700">{suppliers.length} vendor</span>
          </div>
        </div>

        {/* Total Produk */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Katalog Produk
            </span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-[#23374D]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#23374D] font-mono tabular-nums">
              {activeProductsCount}
            </span>
            <span className="text-xs text-slate-500">SKU aktif</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <span>Stok rendah / kritis:</span>
            <span className={`font-semibold ${lowStockProducts.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {lowStockProducts.length} item
            </span>
          </div>
        </div>

        {/* Total Persediaan Barang */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Persediaan Barang
            </span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-[#23374D]">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#23374D] font-mono tabular-nums">
              {formatNumber(totalStockUnits)} <span className="text-xs font-normal text-slate-500">unit</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <span>Nilai estimasi aset:</span>
            <span className="font-semibold text-slate-800 font-mono tabular-nums">
              {formatRupiah(totalStockValuation)}
            </span>
          </div>
        </div>

        {/* PO Bulan Berjalan & Nilai Total */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pembelian Bulan Ini
            </span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-[#23374D]">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#23374D] font-mono tabular-nums">
              {currentMonthPOs.length}
            </span>
            <span className="text-xs text-slate-500">transaksi PO</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <span>Total nilai pengadaan:</span>
            <span className="font-semibold text-[#23374D] font-mono tabular-nums">
              {formatRupiah(currentMonthValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Trend Chart & Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchasing Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#23374D] uppercase tracking-wide">
                  Grafik Pembelian Bulanan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Volume belanja pengadaan periode Juni – Oktober 2026
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Kumulatif PO:</span>
                <div className="text-sm font-bold text-[#23374D] font-mono tabular-nums">
                  {formatRupiah(totalPurchasesValue)}
                </div>
              </div>
            </div>

            {/* Clean Bar Visualization */}
            <div className="h-48 pt-6 pb-2 flex items-end gap-3 sm:gap-6 border-b border-slate-100 px-2">
              {monthlyTrends.map((trend) => (
                <div key={trend.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] text-slate-600 font-mono tabular-nums opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatRupiah(trend.amount).slice(0, -3)}rb
                  </div>
                  <div className="w-full max-w-[48px] bg-slate-100 rounded-t-md h-36 flex items-end overflow-hidden">
                    <div
                      style={{ height: `${trend.height}%` }}
                      className={`w-full transition-all duration-300 rounded-t-sm ${
                        trend.month === 'Okt'
                          ? 'bg-[#23374D]'
                          : 'bg-[#526D82]/70 group-hover:bg-[#526D82]'
                      }`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{trend.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-xs bg-[#23374D]" />
                <span>Bulan Berjalan (Okt)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-xs bg-[#526D82]" />
                <span>Bulan Sebelumnya</span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-[#526D82] hover:text-[#23374D] font-semibold text-xs inline-flex items-center gap-1"
            >
              Lihat Laporan Lengkap
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Low Stock Warning Box */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#23374D]">Informasi Stok Rendah</h3>
                <p className="text-[11px] text-slate-500">Stok berada di bawah batas minimum</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {lowStockProducts.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-60 space-y-2.5 pr-1">
            {lowStockProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8 text-slate-400">
                <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-xs font-medium text-slate-600">Seluruh stok barang aman</p>
                <p className="text-[11px] text-slate-400">Tidak ada produk di bawah batas aman</p>
              </div>
            ) : (
              lowStockProducts.map((p) => {
                const ratio = Math.round((p.currentStock / p.minStock) * 100);
                return (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-lg border border-rose-100 bg-rose-50/40 text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-[#23374D] font-semibold truncate max-w-[180px]">{p.name}</span>
                      <span className="text-rose-700 font-mono font-bold">{ratio}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>SKU: {p.sku}</span>
                      <span>
                        Sisa: <strong className="text-rose-700 font-mono">{p.currentStock}</strong> / Min: {p.minStock} {p.unit}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('inventory')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-[#23374D] font-semibold text-xs rounded-lg transition-colors text-center"
            >
              Kelola Mutasi & Restock Barang
            </button>
          </div>
        </div>
      </div>

      {/* Recent Purchase Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#23374D] uppercase tracking-wide">
              Daftar Pesanan Pembelian Terbaru (PO)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Transaksi pengadaan terkini yang memerlukan pemantauan dan tindak lanjut
            </p>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-xs font-semibold text-[#526D82] hover:text-[#23374D] inline-flex items-center gap-1"
          >
            <span>Semua Pesanan</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">No. PO</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Tanggal Pesan</th>
                <th className="px-4 py-3 text-right">Total Nilai</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Dibuat Oleh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#27313B]">
              {recentOrders.map((po) => {
                const color = getPOStatusColor(po.status);
                return (
                  <tr key={po.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-[#23374D]">
                      {po.poNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {po.supplierName}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono">
                      {formatDate(po.orderDate)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                      {formatRupiah(po.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${color.bg} ${color.text} ${color.border}`}
                      >
                        {getPOStatusLabel(po.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500 text-[11px]">
                      {po.createdBy}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
