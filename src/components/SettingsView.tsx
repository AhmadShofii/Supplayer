import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Shield,
  RotateCcw,
  Save,
  CheckCircle2,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsView: React.FC = () => {
  const { companySettings, updateCompanySettings, resetToInitialData, currentUser } = useApp();

  const [formData, setFormData] = useState({ ...companySettings });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const canEdit = ['super_admin', 'admin'].includes(currentUser?.role || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(formData);
  };

  const roleMatrix = [
    { module: 'Dashboard & Statistik', super: 'Full', admin: 'Full', purch: 'Full', gudang: 'Full', mgmt: 'Read' },
    { module: 'Manajemen Supplier', super: 'CRUD', admin: 'CRUD', purch: 'CRUD', gudang: 'Tidak', mgmt: 'Read' },
    { module: 'Katalog Produk & Kategori', super: 'CRUD', admin: 'CRUD', purch: 'Read', gudang: 'Read', mgmt: 'Read' },
    { module: 'Persediaan & Mutasi Stok', super: 'CRUD', admin: 'CRUD', purch: 'Read', gudang: 'CRUD', mgmt: 'Read' },
    { module: 'Purchase Order (PO)', super: 'CRUD + Approve', admin: 'CRUD + Approve', purch: 'Create + Edit', gudang: 'Terima Barang', mgmt: 'Read' },
    { module: 'Laporan & Ekspor CSV', super: 'Full', admin: 'Full', purch: 'Full', gudang: 'Full', mgmt: 'Full' },
    { module: 'Manajemen Pengguna & Role', super: 'Full', admin: 'Read', purch: 'Tidak', gudang: 'Tidak', mgmt: 'Tidak' },
    { module: 'Audit Log Sistem', super: 'Full', admin: 'Full', purch: 'Tidak', gudang: 'Tidak', mgmt: 'Read' },
  ];

  return (
    <div className="space-y-6">
      {/* Company Profile Settings Form */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="bg-[#23374D] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#8FA99B]" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">Identitas & Profil Perusahaan</h3>
              <p className="text-[11px] text-slate-300">
                Informasi kop surat dan data perpajakan resmi pada Purchase Order (PO)
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nama Resmi Badan Usaha
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nama Dagang (Brand)
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={formData.tradeName}
                onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                NPWP Perusahaan
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={formData.npwp}
                onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Telepon Kantor
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Korespondensi
              </label>
              <input
                type="email"
                disabled={!canEdit}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Alamat Fasilitas Pabrik / Gudang Pusat
            </label>
            <textarea
              rows={2}
              disabled={!canEdit}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tarif Default PPN (%)
              </label>
              <input
                type="number"
                disabled={!canEdit}
                value={formData.defaultTaxPercent}
                onChange={(e) => setFormData({ ...formData, defaultTaxPercent: Number(e.target.value) })}
                className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Website Resmi
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-60"
              />
            </div>
          </div>

          {canEdit && (
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#23374D] hover:bg-[#1a293a] rounded-lg transition-colors shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Profil Perusahaan</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Role Permission Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#23374D] uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#526D82]" />
              <span>Matriks Hak Akses Pengguna Sesuai PRD</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Pembagian kewenangan sistem untuk menjaga keamanan operasional rantai pasok
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Modul Aplikasi</th>
                <th className="px-4 py-3 text-center">Super Admin</th>
                <th className="px-4 py-3 text-center">Admin Operasional</th>
                <th className="px-4 py-3 text-center">Staf Purchasing</th>
                <th className="px-4 py-3 text-center">Staf Gudang</th>
                <th className="px-4 py-3 text-center">Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#27313B]">
              {roleMatrix.map((row) => (
                <tr key={row.module} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{row.module}</td>
                  <td className="px-4 py-2.5 text-center font-mono font-semibold text-[#23374D]">{row.super}</td>
                  <td className="px-4 py-2.5 text-center font-mono text-slate-700">{row.admin}</td>
                  <td className="px-4 py-2.5 text-center font-mono text-slate-700">{row.purch}</td>
                  <td className="px-4 py-2.5 text-center font-mono text-slate-700">{row.gudang}</td>
                  <td className="px-4 py-2.5 text-center font-mono text-slate-500">{row.mgmt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone: Reset Data Demo */}
      <div className="bg-rose-50/50 rounded-xl border border-rose-200/80 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Reset Database Simulasi Demo</span>
            </h4>
            <p className="text-xs text-rose-700 mt-1 max-w-xl leading-relaxed">
              Kembalikan seluruh data master supplier, produk, stok awal, purchase order, dan riwayat mutasi ke data uji coba pabrik semula.
            </p>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data Awal</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-900">Konfirmasi Reset Database</h3>
              <p className="text-xs text-slate-500 mt-1">
                Seluruh data perubahan yang Anda buat selama sesi ini akan diganti dengan data seed awal PT Supplier.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToInitialData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
