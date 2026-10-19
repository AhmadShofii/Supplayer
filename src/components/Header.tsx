import React, { useState } from 'react';
import { Menu, UserCheck, Shield, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getRoleLabel } from '../lib/formatters';
import { UserRole } from '../types';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { activeTab, currentUser, switchUserRole } = useApp();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const getTabTitle = (tab: string): { title: string; subtitle: string } => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Dashboard Utama', subtitle: 'Ringkasan operasional bisnis dan metrik pengadaan' };
      case 'suppliers':
        return { title: 'Manajemen Supplier', subtitle: 'Direktori mitra vendor dan histori kemitraan' };
      case 'products':
        return { title: 'Katalog Produk & Kategori', subtitle: 'Daftar master produk, SKU, dan harga standar' };
      case 'inventory':
        return { title: 'Persediaan & Mutasi Stok', subtitle: 'Monitoring saldo barang dan histori mutasi gudang' };
      case 'orders':
        return { title: 'Purchase Order (PO)', subtitle: 'Pencatatan pengadaan barang dan approval alur pembelian' };
      case 'reports':
        return { title: 'Laporan Operasional', subtitle: 'Ekspor data CSV dan rekapitulasi periodik' };
      case 'users':
        return { title: 'Manajemen Pengguna & Audit', subtitle: 'Hak akses staf dan rekam jejak aktivitas sistem' };
      case 'settings':
        return { title: 'Profil & Pengaturan Perusahaan', subtitle: 'Konfigurasi identitas perusahaan dan parameter sistem' };
      default:
        return { title: 'Sistem Informasi PT Supplier', subtitle: 'Modul terintegrasi' };
    }
  };

  const { title, subtitle } = getTabTitle(activeTab);

  const roles: { role: UserRole; label: string }[] = [
    { role: 'super_admin', label: 'Super Admin (Akses Penuh)' },
    { role: 'admin', label: 'Admin Operasional' },
    { role: 'purchasing', label: 'Staf Purchasing' },
    { role: 'gudang', label: 'Staf Gudang' },
    { role: 'manajemen', label: 'Manajemen (Read-Only)' },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Contextual Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="hidden sm:inline">PT Supplier</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span className="text-[#23374D] font-semibold">{title}</span>
          </div>
          <p className="text-[11px] text-slate-500 truncate hidden md:block">{subtitle}</p>
        </div>
      </div>

      {/* Right: Quick Role Switcher for seamless testing & Profile info */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Role Switcher Pill Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-md transition-colors"
            title="Ganti peran untuk menguji hak akses"
          >
            <Shield className="w-3.5 h-3.5 text-[#526D82]" />
            <span className="hidden sm:inline font-normal text-slate-500">Peran:</span>
            <span className="font-semibold text-[#23374D]">
              {currentUser ? getRoleLabel(currentUser.role) : 'Pilih Peran'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {roleDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setRoleDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Uji Hak Akses Pengguna
                </div>
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchUserRole(r.role);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                      currentUser?.role === r.role
                        ? 'bg-slate-50 text-[#23374D] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{r.label}</span>
                    {currentUser?.role === r.role && (
                      <UserCheck className="w-4 h-4 text-[#8FA99B]" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* User Identity */}
        {currentUser && (
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
            <div className="w-7 h-7 rounded-full bg-[#23374D] text-[#8FA99B] flex items-center justify-center font-bold text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden lg:block">
              <div className="font-medium text-[#27313B] text-xs leading-none">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 leading-none">{currentUser.department}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
