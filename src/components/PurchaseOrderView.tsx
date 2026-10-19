import React, { useMemo, useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  FileText,
  Printer,
  CheckCircle,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  Trash2,
  X,
  Building2,
  Calendar,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, formatNumber, formatRupiah, getPOStatusColor, getPOStatusLabel } from '../lib/formatters';
import { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from '../types';
import { PurchaseOrderVoucherModal } from './PurchaseOrderVoucherModal';

export const PurchaseOrderView: React.FC = () => {
  const {
    purchaseOrders,
    suppliers,
    products,
    createPurchaseOrder,
    updatePurchaseOrderStatus,
    deletePurchaseOrder,
    currentUser,
    companySettings,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedVoucherPO, setSelectedVoucherPO] = useState<PurchaseOrder | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New PO Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [applyTax, setApplyTax] = useState(true);
  const [orderItems, setOrderItems] = useState<
    Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>
  >([]);

  const canCreate = ['super_admin', 'admin', 'purchasing'].includes(currentUser?.role || '');
  const canApprove = ['super_admin', 'admin'].includes(currentUser?.role || '');
  const canReceive = ['super_admin', 'admin', 'gudang'].includes(currentUser?.role || '');

  // Filtered POs
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchSearch =
        po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'all' || po.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [purchaseOrders, searchQuery, statusFilter]);

  // Open Create Modal
  const openCreateModal = () => {
    const initialSupplier = suppliers.find((s) => s.status === 'active') || suppliers[0];
    const supId = initialSupplier?.id || '';
    setSelectedSupplierId(supId);

    // Filter products for this supplier if any
    const supProducts = products.filter((p) => p.supplierId === supId && p.status === 'active');
    const firstProd = supProducts[0] || products[0];

    if (firstProd) {
      setOrderItems([
        {
          productId: firstProd.id,
          quantity: 10,
          unitPrice: firstProd.buyPrice,
        },
      ]);
    } else {
      setOrderItems([]);
    }

    setOrderDate(new Date().toISOString().split('T')[0]);
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setExpectedDeliveryDate(d.toISOString().split('T')[0]);
    setNotes('');
    setApplyTax(true);
    setIsCreateModalOpen(true);
  };

  const handleAddItem = () => {
    const available = products.filter((p) => p.status === 'active');
    if (available.length === 0) return;
    setOrderItems((prev) => [
      ...prev,
      {
        productId: available[0].id,
        quantity: 1,
        unitPrice: available[0].buyPrice,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity' | 'unitPrice', value: any) => {
    setOrderItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === 'productId') {
        item.productId = value;
        const p = products.find((prod) => prod.id === value);
        if (p) item.unitPrice = p.buyPrice;
      } else if (field === 'quantity') {
        item.quantity = Math.max(1, Number(value));
      } else if (field === 'unitPrice') {
        item.unitPrice = Math.max(0, Number(value));
      }

      updated[index] = item;
      return updated;
    });
  };

  // Calculations for PO modal
  const computedSubtotal = useMemo(() => {
    return orderItems.reduce((acc, itm) => acc + itm.quantity * itm.unitPrice, 0);
  }, [orderItems]);

  const taxPercent = applyTax ? companySettings.defaultTaxPercent || 11 : 0;
  const computedTax = Math.round((computedSubtotal * taxPercent) / 100);
  const computedGrandTotal = computedSubtotal + computedTax;

  const handleCreateSubmit = (initialStatus: PurchaseOrderStatus) => {
    if (!selectedSupplierId || orderItems.length === 0) return;

    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    if (!supplier) return;

    const items: PurchaseOrderItem[] = orderItems.map((itm, idx) => {
      const prod = products.find((p) => p.id === itm.productId);
      return {
        id: `poi-${Date.now()}-${idx}`,
        productId: itm.productId,
        productName: prod?.name || 'Produk',
        sku: prod?.sku || `SKU-${idx}`,
        unit: prod?.unit || 'Pcs',
        quantity: itm.quantity,
        unitPrice: itm.unitPrice,
        subtotal: itm.quantity * itm.unitPrice,
      };
    });

    createPurchaseOrder({
      supplierId: selectedSupplierId,
      supplierName: supplier.name,
      orderDate,
      expectedDeliveryDate,
      items,
      subtotal: computedSubtotal,
      taxPercent,
      taxAmount: computedTax,
      totalAmount: computedGrandTotal,
      status: initialStatus,
      notes,
      createdBy: currentUser?.name || 'Staf Purchasing',
    });

    setIsCreateModalOpen(false);
  };

  const handleDeletePO = (po: PurchaseOrder) => {
    if (po.status === 'received') {
      alert('Sesuai PRD Section 4.6: Pesanan yang telah diterima tidak boleh dihapus secara permanen agar riwayat pembelian tetap valid.');
      return;
    }
    if (window.confirm(`Hapus Purchase Order "${po.poNumber}"?`)) {
      deletePurchaseOrder(po.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search PO Number, Supplier, Item */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No. PO, nama supplier, atau item..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
          >
            <option value="all">Semua Status ({purchaseOrders.length})</option>
            <option value="draft">Draft</option>
            <option value="submitted">Diajukan</option>
            <option value="approved">Disetujui</option>
            <option value="processing">Diproses</option>
            <option value="received">Diterima</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>

        {canCreate && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#23374D] hover:bg-[#1a293a] rounded-lg transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Purchase Order (PO)</span>
          </button>
        )}
      </div>

      {/* PO List Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">No. Purchase Order</th>
                <th className="px-4 py-3">Supplier & Vendor</th>
                <th className="px-4 py-3">Tanggal Pesan & Target</th>
                <th className="px-4 py-3">Detail Barang</th>
                <th className="px-4 py-3 text-right">Nilai Total</th>
                <th className="px-4 py-3">Status Alur</th>
                <th className="px-4 py-3 text-right">Kelola Status & Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#27313B]">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium text-slate-600">Tidak ada purchase order ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau filter status.</p>
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po) => {
                  const color = getPOStatusColor(po.status);
                  const isReceived = po.status === 'received';
                  const isCancelled = po.status === 'cancelled';

                  return (
                    <tr key={po.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedVoucherPO(po)}
                          className="font-mono font-bold text-[#23374D] hover:underline flex items-center gap-1.5"
                          title="Buka voucher cetak PO"
                        >
                          <span>{po.poNumber}</span>
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Oleh: {po.createdBy}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800 block">{po.supplierName}</span>
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px]">
                        <div className="text-slate-800">{formatDate(po.orderDate)}</div>
                        <div className="text-slate-400 text-[10px]">
                          Target: {formatDate(po.expectedDeliveryDate)}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-700 block">
                          {po.items.length} jenis barang
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-xs block">
                          {po.items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 text-sm">
                        {formatRupiah(po.totalAmount)}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${color.bg} ${color.text} ${color.border}`}
                        >
                          {getPOStatusLabel(po.status)}
                        </span>
                        {po.approvedBy && (
                          <span className="text-[10px] text-emerald-700 block mt-0.5">
                            Disetujui: {po.approvedBy}
                          </span>
                        )}
                        {po.receivedAt && (
                          <span className="text-[10px] text-emerald-700 block mt-0.5">
                            Masuk Gudang: {formatDate(po.receivedAt)}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1 flex-wrap justify-end">
                          {/* Voucher Print Button */}
                          <button
                            onClick={() => setSelectedVoucherPO(po)}
                            className="p-1.5 text-slate-600 hover:text-[#23374D] hover:bg-slate-100 rounded text-xs font-semibold inline-flex items-center gap-1 border border-slate-200"
                            title="Lihat & Cetak Voucher PO"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-500" />
                            <span>Voucher</span>
                          </button>

                          {/* Approval / Progression Buttons based on current status and role */}
                          {po.status === 'draft' && (
                            <button
                              onClick={() => updatePurchaseOrderStatus(po.id, 'submitted')}
                              className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200"
                            >
                              Ajukan
                            </button>
                          )}

                          {po.status === 'submitted' && canApprove && (
                            <button
                              onClick={() => updatePurchaseOrderStatus(po.id, 'approved')}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-300"
                              title="Setujui Purchase Order ini"
                            >
                              Setujui (Approve)
                            </button>
                          )}

                          {po.status === 'approved' && (
                            <button
                              onClick={() => updatePurchaseOrderStatus(po.id, 'processing')}
                              className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200"
                            >
                              Kirim ke Vendor
                            </button>
                          )}

                          {po.status === 'processing' && canReceive && (
                            <button
                              onClick={() => updatePurchaseOrderStatus(po.id, 'received')}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded shadow-xs"
                              title="Terima barang fisik di gudang & otomatis update saldo persediaan"
                            >
                              Terima Barang
                            </button>
                          )}

                          {/* Cancel button if not received & not cancelled */}
                          {!isReceived && !isCancelled && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Batalkan Purchase Order ${po.poNumber}?`)) {
                                  updatePurchaseOrderStatus(po.id, 'cancelled');
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="Batalkan Pesanan"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete button (PRD Rule: Cannot delete received orders) */}
                          <button
                            onClick={() => handleDeletePO(po)}
                            disabled={isReceived}
                            className={`p-1.5 rounded ${
                              isReceived
                                ? 'text-slate-300 cursor-not-allowed opacity-40'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={
                              isReceived
                                ? 'PO berstatus Diterima tidak boleh dihapus (PRD 4.6)'
                                : 'Hapus PO'
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* CREATE PO MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full border border-slate-200 shadow-2xl my-8 overflow-hidden text-xs">
            <div className="bg-[#23374D] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#8FA99B]" />
                <h3 className="text-sm font-bold tracking-tight">Buat Purchase Order Baru</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Supplier and Date selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200/80">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Pilih Supplier Mitra <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                  >
                    {suppliers
                      .filter((s) => s.status === 'active')
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal Order PO <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Estimasi Tiba di Gudang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                  />
                </div>
              </div>

              {/* Items Table Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Daftar Item Barang Pesanan ({orderItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-[#23374D] font-semibold rounded-md border border-slate-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris Item</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Produk Terdaftar</th>
                        <th className="p-2.5 w-24 text-right">Qty</th>
                        <th className="p-2.5 w-36 text-right">Harga Satuan (Rp)</th>
                        <th className="p-2.5 w-36 text-right">Subtotal</th>
                        <th className="p-2.5 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orderItems.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400 italic">
                            Belum ada item ditambahkan. Klik "Tambah Baris Item" di atas.
                          </td>
                        </tr>
                      ) : (
                        orderItems.map((item, idx) => {
                          const sub = item.quantity * item.unitPrice;
                          const currentProd = products.find((p) => p.id === item.productId);

                          return (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-2">
                                <select
                                  value={item.productId}
                                  onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded font-medium text-slate-800"
                                >
                                  {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name} ({p.sku}) — {p.unit}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-2 text-right">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                  className="w-full p-1.5 font-mono text-right bg-slate-50 border border-slate-200 rounded"
                                />
                              </td>
                              <td className="p-2 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  value={item.unitPrice}
                                  onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                                  className="w-full p-1.5 font-mono text-right bg-slate-50 border border-slate-200 rounded"
                                />
                              </td>
                              <td className="p-2 text-right font-mono font-bold text-slate-900">
                                {formatRupiah(sub)}
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes & Financial Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Instruksi Khusus / Syarat Pengadaan
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Pengiriman via armada truk tertutup, barang dilindungi palet plastik..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                  />

                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="applyTax"
                      checked={applyTax}
                      onChange={(e) => setApplyTax(e.target.checked)}
                      className="rounded border-slate-300 text-[#23374D] focus:ring-[#23374D]"
                    />
                    <label htmlFor="applyTax" className="text-xs text-slate-700 font-medium">
                      Kenakan Pajak Pertambahan Nilai (PPN {companySettings.defaultTaxPercent}%)
                    </label>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 font-mono text-xs">
                  <div className="p-2.5 flex justify-between">
                    <span className="font-sans text-slate-500">Subtotal Belanja:</span>
                    <span className="font-semibold text-slate-800">{formatRupiah(computedSubtotal)}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="font-sans text-slate-500">PPN ({taxPercent}%):</span>
                    <span className="text-slate-800">{formatRupiah(computedTax)}</span>
                  </div>
                  <div className="p-3 flex justify-between bg-slate-50 font-bold text-sm text-[#23374D]">
                    <span className="font-sans">Grand Total:</span>
                    <span>{formatRupiah(computedGrandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCreateSubmit('draft')}
                    disabled={orderItems.length === 0}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg disabled:opacity-50"
                  >
                    Simpan Sebagai Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateSubmit('submitted')}
                    disabled={orderItems.length === 0}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#23374D] hover:bg-[#1a293a] rounded-lg shadow-xs disabled:opacity-50"
                  >
                    Terbitkan & Ajukan PO
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VOUCHER PREVIEW / PRINT MODAL */}
      {selectedVoucherPO && (
        <PurchaseOrderVoucherModal
          po={selectedVoucherPO}
          onClose={() => setSelectedVoucherPO(null)}
        />
      )}
    </div>
  );
};
