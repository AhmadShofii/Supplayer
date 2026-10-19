import React, { useMemo, useState } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Building2,
  Package,
  Boxes,
  ShoppingCart,
  History,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { downloadCSV } from '../lib/csvExport';
import { formatDate, formatNumber, formatRupiah, getPOStatusLabel } from '../lib/formatters';

type ReportTab = 'suppliers' | 'products' | 'inventory_alerts' | 'movements' | 'purchases';

export const ReportsView: React.FC = () => {
  const { suppliers, products, categories, purchaseOrders, movements, companySettings } = useApp();

  const [activeReport, setActiveReport] = useState<ReportTab>('purchases');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [poStatusFilter, setPoStatusFilter] = useState('all');

  // Filtered Purchases
  const filteredPurchases = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchStart = !startDate || po.orderDate >= startDate;
      const matchEnd = !endDate || po.orderDate <= endDate;
      const matchStatus = poStatusFilter === 'all' || po.status === poStatusFilter;
      return matchStart && matchEnd && matchStatus;
    });
  }, [purchaseOrders, startDate, endDate, poStatusFilter]);

  // Filtered Movements
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const mDate = m.createdAt.split('T')[0];
      const matchStart = !startDate || mDate >= startDate;
      const matchEnd = !endDate || mDate <= endDate;
      return matchStart && matchEnd;
    });
  }, [movements, startDate, endDate]);

  // Low stock products
  const lowStockItems = useMemo(() => {
    return products.filter((p) => p.status === 'active' && p.currentStock <= p.minStock);
  }, [products]);

  // CSV Export Handler
  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().split('T')[0];

    if (activeReport === 'suppliers') {
      const headers = ['ID Supplier', 'Nama Perusahaan', 'Kontak Person', 'Telepon', 'Email', 'Alamat', 'Status'];
      const rows = suppliers.map((s) => [s.id, s.name, s.contactPerson, s.phone, s.email, s.address, s.status]);
      downloadCSV(`Laporan_Supplier_PT_Supplier_${timestamp}`, headers, rows);
    } else if (activeReport === 'products') {
      const headers = [
        'SKU',
        'Nama Produk',
        'Kategori',
        'Supplier',
        'Satuan',
        'Harga Beli Satuan',
        'Stok Gudang',
        'Stok Minimum',
        'Total Nilai Persediaan',
        'Status',
      ];
      const rows = products.map((p) => {
        const cat = categories.find((c) => c.id === p.categoryId)?.name || '-';
        const sup = suppliers.find((s) => s.id === p.supplierId)?.name || '-';
        return [
          p.sku,
          p.name,
          cat,
          sup,
          p.unit,
          p.buyPrice,
          p.currentStock,
          p.minStock,
          p.currentStock * p.buyPrice,
          p.status,
        ];
      });
      downloadCSV(`Laporan_Katalog_Produk_Aset_${timestamp}`, headers, rows);
    } else if (activeReport === 'inventory_alerts') {
      const headers = ['SKU', 'Nama Produk', 'Stok Saat Ini', 'Batas Minimum', 'Satuan', 'Defisit Reorder'];
      const rows = lowStockItems.map((p) => [
        p.sku,
        p.name,
        p.currentStock,
        p.minStock,
        p.unit,
        Math.max(0, p.minStock - p.currentStock),
      ]);
      downloadCSV(`Laporan_Peringatan_Stok_Kritis_${timestamp}`, headers, rows);
    } else if (activeReport === 'movements') {
      const headers = [
        'Tanggal Mutasi',
        'SKU',
        'Nama Produk',
        'Jenis Mutasi',
        'Jumlah Unit',
        'Stok Sebelum',
        'Stok Sesudah',
        'Referensi',
        'Catatan',
        'Petugas',
      ];
      const rows = filteredMovements.map((m) => {
        const p = products.find((prod) => prod.id === m.productId);
        return [
          m.createdAt,
          p?.sku || '-',
          p?.name || '-',
          m.type,
          m.quantity,
          m.stockBefore,
          m.stockAfter,
          m.referenceId || '-',
          m.notes,
          m.createdBy,
        ];
      });
      downloadCSV(`Laporan_Mutasi_Persediaan_${startDate}_sd_${endDate}`, headers, rows);
    } else if (activeReport === 'purchases') {
      const headers = [
        'No. Purchase Order',
        'Supplier Mitra',
        'Tanggal Order',
        'Target Pengiriman',
        'Subtotal (Rp)',
        'PPN (Rp)',
        'Total Belanja (Rp)',
        'Status Alur',
        'Pembuat',
      ];
      const rows = filteredPurchases.map((po) => [
        po.poNumber,
        po.supplierName,
        po.orderDate,
        po.expectedDeliveryDate,
        po.subtotal,
        po.taxAmount,
        po.totalAmount,
        po.status,
        po.createdBy,
      ]);
      downloadCSV(`Laporan_Pembelian_PO_${startDate}_sd_${endDate}`, headers, rows);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Controls */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Report Tab Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setActiveReport('purchases')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeReport === 'purchases'
                  ? 'bg-white text-[#23374D] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Pembelian (PO)</span>
            </button>
            <button
              onClick={() => setActiveReport('inventory_alerts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeReport === 'inventory_alerts'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Stok Kritis ({lowStockItems.length})</span>
            </button>
            <button
              onClick={() => setActiveReport('products')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeReport === 'products'
                  ? 'bg-white text-[#23374D] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Produk & Aset</span>
            </button>
            <button
              onClick={() => setActiveReport('movements')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeReport === 'movements'
                  ? 'bg-white text-[#23374D] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Mutasi Stok</span>
            </button>
            <button
              onClick={() => setActiveReport('suppliers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeReport === 'suppliers'
                  ? 'bg-white text-[#23374D] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Daftar Supplier</span>
            </button>
          </div>

          {/* Action buttons: Export CSV & Print */}
          <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Unduh CSV (Excel)</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#23374D] bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>

        {/* Date Filters (for purchases & movements) */}
        {(activeReport === 'purchases' || activeReport === 'movements') && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Periode Transaksi:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1 font-mono text-xs bg-slate-50 border border-slate-200 rounded-md"
              />
              <span className="text-slate-400">s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1 font-mono text-xs bg-slate-50 border border-slate-200 rounded-md"
              />
            </div>

            {activeReport === 'purchases' && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-slate-500 font-medium">Filter Status:</span>
                <select
                  value={poStatusFilter}
                  onChange={(e) => setPoStatusFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md"
                >
                  <option value="all">Semua Status</option>
                  <option value="received">Hanya Diterima</option>
                  <option value="approved">Hanya Disetujui</option>
                  <option value="processing">Hanya Diproses</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Display Container (Formatted for both screen & print) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs overflow-hidden">
        {/* Print Header */}
        <div className="mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-[#526D82] uppercase tracking-wider block">
                {companySettings.name}
              </span>
              <h2 className="text-lg font-bold text-[#23374D] mt-0.5">
                {activeReport === 'purchases' && 'Laporan Rekapitulasi Pembelian & Purchase Order'}
                {activeReport === 'inventory_alerts' && 'Laporan Peringatan Persediaan Kritis & Rencana Reorder'}
                {activeReport === 'products' && 'Laporan Master Katalog Produk & Valuasi Aset Stok'}
                {activeReport === 'movements' && 'Laporan Histori Mutasi Barang Gudang'}
                {activeReport === 'suppliers' && 'Laporan Direktori Mitra Rekanan Supplier'}
              </h2>
            </div>
            <div className="text-right text-[11px] font-mono text-slate-500">
              <div>Dicetak: {formatDate(new Date().toISOString())}</div>
              {(activeReport === 'purchases' || activeReport === 'movements') && (
                <div>Periode: {formatDate(startDate)} s/d {formatDate(endDate)}</div>
              )}
            </div>
          </div>
        </div>

        {/* TAB 1: LAPORAN PEMBELIAN */}
        {activeReport === 'purchases' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 text-[11px] block">Jumlah Transaksi PO:</span>
                <span className="text-lg font-bold font-mono text-[#23374D]">{filteredPurchases.length} pesanan</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Total Nilai Sebelum Pajak:</span>
                <span className="text-lg font-bold font-mono text-slate-800">
                  {formatRupiah(filteredPurchases.reduce((acc, p) => acc + p.subtotal, 0))}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Total Realisasi Belanja (Inc. PPN):</span>
                <span className="text-lg font-bold font-mono text-[#23374D]">
                  {formatRupiah(filteredPurchases.reduce((acc, p) => acc + p.totalAmount, 0))}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">No. PO</th>
                    <th className="p-2.5">Supplier</th>
                    <th className="p-2.5">Tgl Pesan</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                    <th className="p-2.5 text-right">PPN</th>
                    <th className="p-2.5 text-right">Total Transaksi</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredPurchases.map((po) => (
                    <tr key={po.id}>
                      <td className="p-2.5 font-bold text-[#23374D]">{po.poNumber}</td>
                      <td className="p-2.5 font-sans font-medium text-slate-800">{po.supplierName}</td>
                      <td className="p-2.5 text-slate-500">{formatDate(po.orderDate)}</td>
                      <td className="p-2.5 text-right text-slate-700">{formatRupiah(po.subtotal)}</td>
                      <td className="p-2.5 text-right text-slate-500">{formatRupiah(po.taxAmount)}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{formatRupiah(po.totalAmount)}</td>
                      <td className="p-2.5 font-sans">
                        <span className="text-[11px] font-semibold">{getPOStatusLabel(po.status)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: LAPORAN STOK KRITIS */}
        {activeReport === 'inventory_alerts' && (
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-xs text-rose-800">
              Menampilkan <strong>{lowStockItems.length} produk</strong> yang stok fisiknya berada pada atau di bawah batas minimum pengamanan gudang.
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">SKU</th>
                    <th className="p-2.5">Nama Produk</th>
                    <th className="p-2.5">Supplier Terkait</th>
                    <th className="p-2.5 text-right">Stok Fisik</th>
                    <th className="p-2.5 text-right">Min. Safety</th>
                    <th className="p-2.5 text-right">Rekomendasi Reorder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {lowStockItems.map((p) => {
                    const sup = suppliers.find((s) => s.id === p.supplierId);
                    const deficit = Math.max(0, p.minStock - p.currentStock);
                    return (
                      <tr key={p.id}>
                        <td className="p-2.5 font-bold text-[#23374D]">{p.sku}</td>
                        <td className="p-2.5 font-sans font-medium text-slate-800">{p.name}</td>
                        <td className="p-2.5 font-sans text-slate-600">{sup?.name || '-'}</td>
                        <td className="p-2.5 text-right font-bold text-rose-600">
                          {p.currentStock} {p.unit}
                        </td>
                        <td className="p-2.5 text-right text-slate-500">
                          {p.minStock} {p.unit}
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900">
                          +{deficit + p.minStock} {p.unit}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUK & VALUASI */}
        {activeReport === 'products' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">SKU</th>
                    <th className="p-2.5">Nama Produk</th>
                    <th className="p-2.5">Kategori</th>
                    <th className="p-2.5 text-right">Harga Satuan</th>
                    <th className="p-2.5 text-right">Stok Fisik</th>
                    <th className="p-2.5 text-right">Total Nilai Persediaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {products.map((p) => {
                    const cat = categories.find((c) => c.id === p.categoryId)?.name || '-';
                    const valuation = p.currentStock * p.buyPrice;
                    return (
                      <tr key={p.id}>
                        <td className="p-2.5 font-bold text-[#23374D]">{p.sku}</td>
                        <td className="p-2.5 font-sans font-medium text-slate-800">{p.name}</td>
                        <td className="p-2.5 font-sans text-slate-600">{cat}</td>
                        <td className="p-2.5 text-right text-slate-700">{formatRupiah(p.buyPrice)}</td>
                        <td className="p-2.5 text-right font-semibold text-slate-900">
                          {p.currentStock} {p.unit}
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900">{formatRupiah(valuation)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: MUTASI STOK */}
        {activeReport === 'movements' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Waktu</th>
                    <th className="p-2.5">Produk</th>
                    <th className="p-2.5">Tipe</th>
                    <th className="p-2.5 text-right">Jumlah</th>
                    <th className="p-2.5 text-right">Perubahan Stok</th>
                    <th className="p-2.5">Referensi</th>
                    <th className="p-2.5">Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredMovements.map((m) => {
                    const prod = products.find((p) => p.id === m.productId);
                    return (
                      <tr key={m.id}>
                        <td className="p-2.5 text-slate-500 text-[11px]">{m.createdAt.slice(0, 16).replace('T', ' ')}</td>
                        <td className="p-2.5 font-sans font-medium text-slate-800">{prod?.name || '-'}</td>
                        <td className="p-2.5 font-sans font-semibold uppercase text-[10px]">
                          {m.type === 'in' ? 'Masuk' : m.type === 'out' ? 'Keluar' : 'Koreksi'}
                        </td>
                        <td className="p-2.5 text-right font-bold">
                          {m.type === 'in' ? '+' : m.type === 'out' ? '-' : ''}
                          {m.quantity}
                        </td>
                        <td className="p-2.5 text-right text-slate-600">
                          {m.stockBefore} ➔ {m.stockAfter}
                        </td>
                        <td className="p-2.5 text-slate-700">{m.referenceId || '-'}</td>
                        <td className="p-2.5 font-sans text-slate-600">{m.createdBy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SUPPLIER */}
        {activeReport === 'suppliers' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Nama Perusahaan</th>
                    <th className="p-2.5">Kontak Person</th>
                    <th className="p-2.5">Telepon</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suppliers.map((s) => (
                    <tr key={s.id}>
                      <td className="p-2.5 font-bold text-[#23374D]">{s.name}</td>
                      <td className="p-2.5 font-medium text-slate-800">{s.contactPerson}</td>
                      <td className="p-2.5 font-mono text-slate-700">{s.phone}</td>
                      <td className="p-2.5 text-slate-600">{s.email || '-'}</td>
                      <td className="p-2.5">
                        <span className="font-semibold text-[11px] uppercase">
                          {s.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
