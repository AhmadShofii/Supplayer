import React, { useMemo, useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Package,
  ReceiptText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, formatRupiah, getPOStatusColor, getPOStatusLabel } from '../lib/formatters';
import { Supplier } from '../types';

export const SupplierView: React.FC = () => {
  const { suppliers, products, purchaseOrders, addSupplier, updateSupplier, deleteSupplier, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    status: 'active' as 'active' | 'inactive',
  });

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((sup) => {
      const matchSearch =
        sup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sup.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sup.phone.includes(searchQuery) ||
        sup.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || sup.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [suppliers, searchQuery, statusFilter]);

  const canEdit = ['super_admin', 'admin', 'purchasing'].includes(currentUser?.role || '');

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      status: supplier.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.contactPerson.trim() || !formData.phone.trim() || !formData.address.trim()) {
      return;
    }

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, formData);
    } else {
      addSupplier(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (supplier: Supplier) => {
    const hasPO = purchaseOrders.some((po) => po.supplierId === supplier.id);
    const confirmMessage = hasPO
      ? `Supplier "${supplier.name}" telah memiliki riwayat pesanan (PO).\n\nSesuai standar operasional, supplier tidak akan dihapus permanen melainkan dinonaktifkan (diarsipkan). Lanjutkan?`
      : `Apakah Anda yakin ingin menghapus supplier "${supplier.name}"?`;

    if (window.confirm(confirmMessage)) {
      deleteSupplier(supplier.id);
      if (selectedSupplier?.id === supplier.id) {
        setSelectedSupplier(null);
      }
    }
  };

  // Associated data for detail modal
  const supplierProducts = useMemo(() => {
    if (!selectedSupplier) return [];
    return products.filter((p) => p.supplierId === selectedSupplier.id);
  }, [products, selectedSupplier]);

  const supplierPOs = useMemo(() => {
    if (!selectedSupplier) return [];
    return purchaseOrders.filter((po) => po.supplierId === selectedSupplier.id);
  }, [purchaseOrders, selectedSupplier]);

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search & Filters */}
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama supplier, kontak, atau telepon..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D] focus:border-[#23374D]"
            />
          </div>

          {/* Status Filter Segmented Button */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-[#23374D] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({suppliers.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'active'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aktif ({suppliers.filter((s) => s.status === 'active').length})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'inactive'
                  ? 'bg-white text-slate-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nonaktif ({suppliers.filter((s) => s.status === 'inactive').length})
            </button>
          </div>
        </div>

        {/* Add Supplier Button */}
        {canEdit && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#23374D] hover:bg-[#1a293a] rounded-lg transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Supplier</span>
          </button>
        )}
      </div>

      {/* Supplier Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">Nama Perusahaan / Supplier</th>
                <th className="px-4 py-3">Kontak Person</th>
                <th className="px-4 py-3">Telepon & Email</th>
                <th className="px-4 py-3">Alamat</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#27313B]">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium text-slate-600">Tidak ada supplier ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Coba ubah kata kunci pencarian atau filter status yang dipilih.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedSupplier(supplier)}
                        className="text-left font-semibold text-[#23374D] hover:underline flex items-center gap-1.5"
                      >
                        <span>{supplier.name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </button>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        ID: {supplier.id}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {supplier.contactPerson}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800 font-mono text-[11px]">{supplier.phone}</div>
                      <div className="text-slate-400 text-[11px] truncate max-w-[160px]">
                        {supplier.email || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={supplier.address}>
                      {supplier.address}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                          supplier.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        {supplier.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setSelectedSupplier(supplier)}
                          className="px-2 py-1 text-slate-600 hover:text-[#23374D] hover:bg-slate-100 rounded text-xs font-medium"
                          title="Lihat Detail & Histori PO"
                        >
                          Detail
                        </button>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => openEditModal(supplier)}
                              className="p-1.5 text-slate-500 hover:text-[#23374D] hover:bg-slate-100 rounded"
                              title="Edit Supplier"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(supplier)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="Hapus / Arsipkan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-[#23374D] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#8FA99B]" />
                <h3 className="text-sm font-bold tracking-tight">
                  {editingSupplier ? 'Ubah Data Supplier' : 'Tambah Supplier Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Perusahaan / Supplier <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: PT Krakatau Baja Industri"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Kontak Person <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Nama PIC / Sales"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nomor Telepon <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Contoh: 021-3844-9911"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Alamat Email (Opsional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sales@perusahaan.co.id"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Status Kemitraan
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                  >
                    <option value="active">Aktif (Dapat Melakukan Transaksi)</option>
                    <option value="inactive">Nonaktif (Diarsipkan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Alamat Lengkap Kantor / Pabrik <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Kawasan Industri, nama jalan, kota, provinsi..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#23374D] hover:bg-[#1a293a] rounded-lg transition-colors shadow-xs"
                >
                  {editingSupplier ? 'Simpan Perubahan' : 'Tambahkan Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Detail Drawer / Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-[#23374D] px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[11px] text-[#8FA99B] font-mono uppercase tracking-wider">
                  Detail Profil Supplier
                </span>
                <h3 className="text-base font-bold tracking-tight">{selectedSupplier.name}</h3>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="text-slate-300 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Basic Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Kontak Person</span>
                  <span className="font-semibold text-slate-800 text-sm">{selectedSupplier.contactPerson}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Status Kemitraan</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mt-0.5 uppercase tracking-wider ${
                      selectedSupplier.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {selectedSupplier.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Telepon</span>
                  <span className="font-mono text-slate-800">{selectedSupplier.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                  <span className="text-slate-800">{selectedSupplier.email || '-'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Alamat</span>
                  <span className="text-slate-700">{selectedSupplier.address}</span>
                </div>
              </div>

              {/* Supplied Products */}
              <div>
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 text-xs">
                  <Package className="w-4 h-4 text-[#526D82]" />
                  <span>Katalog Produk dari Supplier Ini ({supplierProducts.length})</span>
                </div>
                {supplierProducts.length === 0 ? (
                  <p className="text-slate-400 italic">Belum ada produk terdaftar untuk supplier ini.</p>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-2">SKU</th>
                          <th className="p-2">Nama Produk</th>
                          <th className="p-2 text-right">Harga Beli Standar</th>
                          <th className="p-2 text-right">Stok Gudang</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {supplierProducts.map((p) => (
                          <tr key={p.id}>
                            <td className="p-2 font-mono text-slate-600">{p.sku}</td>
                            <td className="p-2 font-medium text-slate-800">{p.name}</td>
                            <td className="p-2 text-right font-mono">{formatRupiah(p.buyPrice)}</td>
                            <td className="p-2 text-right font-mono font-semibold">
                              {p.currentStock} {p.unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Purchase Order History */}
              <div>
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 text-xs">
                  <ReceiptText className="w-4 h-4 text-[#526D82]" />
                  <span>Histori Purchase Order ({supplierPOs.length})</span>
                </div>
                {supplierPOs.length === 0 ? (
                  <p className="text-slate-400 italic">Belum ada transaksi purchase order untuk supplier ini.</p>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-2">No. PO</th>
                          <th className="p-2">Tanggal</th>
                          <th className="p-2 text-right">Total Transaksi</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {supplierPOs.map((po) => {
                          const color = getPOStatusColor(po.status);
                          return (
                            <tr key={po.id}>
                              <td className="p-2 font-mono font-semibold text-[#23374D]">{po.poNumber}</td>
                              <td className="p-2 font-mono text-slate-500">{formatDate(po.orderDate)}</td>
                              <td className="p-2 text-right font-mono font-bold text-slate-900">
                                {formatRupiah(po.totalAmount)}
                              </td>
                              <td className="p-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${color.bg} ${color.text} ${color.border}`}
                                >
                                  {getPOStatusLabel(po.status)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedSupplier(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
