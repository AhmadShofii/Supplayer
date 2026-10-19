import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Package,
  Boxes,
  ShoppingCart,
  FileBarChart,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getRoleLabel } from '../lib/formatters';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, currentUser, logout, products, purchaseOrders } = useApp();

  // Metrics for badges
  const lowStockCount = products.filter((p) => p.status === 'active' && p.currentStock <= p.minStock).length;
  const pendingPOCount = purchaseOrders.filter((po) => ['draft', 'submitted', 'processing'].includes(po.status)).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      allowedRoles: ['super_admin', 'admin', 'purchasing', 'gudang', 'manajemen'],
    },
    {
      id: 'suppliers',
      label: 'Supplier',
      icon: Building2,
      badge: null,
      allowedRoles: ['super_admin', 'admin', 'purchasing', 'manajemen'],
    },
    {
      id: 'products',
      label: 'Produk & Kategori',
      icon: Package,
      badge: null,
      allowedRoles: ['super_admin', 'admin', 'purchasing', 'gudang', 'manajemen'],
    },
    {
      id: 'inventory',
      label: 'Persediaan',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} Kritis` : null,
      badgeColor: 'bg-rose-900/60 text-rose-200 border border-rose-700/50',
      allowedRoles: ['super_admin', 'admin', 'gudang', 'manajemen'],
    },
    {
      id: 'orders',
      label: 'Purchase Order',
      icon: ShoppingCart,
      badge: pendingPOCount > 0 ? `${pendingPOCount} Aktif` : null,
      badgeColor: 'bg-amber-900/60 text-amber-200 border border-amber-700/50',
      allowedRoles: ['super_admin', 'admin', 'purchasing', 'gudang', 'manajemen'],
    },
    {
      id: 'reports',
      label: 'Laporan',
      icon: FileBarChart,
      badge: null,
      allowedRoles: ['super_admin', 'admin', 'purchasing', 'gudang', 'manajemen'],
    },
    {
      id: 'users',
      label: 'Pengguna & Audit',
      icon: Users,
      badge: null,
      allowedRoles: ['super_admin', 'admin'],
    },
    {
      id: 'settings',
      label: 'Pengaturan',
      icon: Settings,
      badge: null,
      allowedRoles: ['super_admin', 'admin', 'manajemen'],
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !currentUser || item.allowedRoles.includes(currentUser.role)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#23374D] text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-[#526D82]/30 bg-[#1e2f42] gap-3 shrink-0">
          <div className="w-9 h-9 rounded-md bg-[#8FA99B] flex items-center justify-center font-bold text-[#23374D] shadow-sm shrink-0">
            <span className="text-sm font-black tracking-wider">PTS</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-white truncate">PT SUPPLIER</h1>
            <p className="text-[11px] text-[#8FA99B] font-medium truncate">Sistem Manajemen Terpadu</p>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu Utama
          </div>

          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-[#526D82] text-white shadow-xs'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#8FA99B]' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#8FA99B] opacity-80" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* User Card & Logout */}
        {currentUser && (
          <div className="p-3 border-t border-[#526D82]/30 bg-[#1c2c3e] shrink-0">
            <div className="p-2.5 rounded-lg bg-[#23374D]/80 border border-[#526D82]/40 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#526D82] flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                  <div className="flex items-center gap-1 text-[11px] text-[#8FA99B]">
                    <ShieldCheck className="w-3 h-3 shrink-0" />
                    <span className="truncate">{getRoleLabel(currentUser.role)}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-rose-900/30 rounded-lg transition-colors border border-transparent hover:border-rose-800/40"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Keluar Sesi</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
