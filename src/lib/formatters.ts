import { PurchaseOrderStatus, UserRole } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('id-ID').format(val);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin Operasional';
    case 'purchasing':
      return 'Staf Purchasing';
    case 'gudang':
      return 'Staf Gudang';
    case 'manajemen':
      return 'Manajemen';
    default:
      return role;
  }
}

export function getRoleDescription(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'Akses penuh ke seluruh modul, audit log, pengguna, dan pengaturan';
    case 'admin':
      return 'Pengelolaan CRUD supplier, produk, pesanan pembelian, dan stok';
    case 'purchasing':
      return 'Membuat & mengelola pesanan pembelian (PO) serta direktori supplier';
    case 'gudang':
      return 'Mencatat mutasi persediaan barang masuk/keluar dan penerimaan PO';
    case 'manajemen':
      return 'Melihat statistik dashboard eksekutif dan laporan perusahaan';
    default:
      return '';
  }
}

export function getPOStatusLabel(status: PurchaseOrderStatus): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'submitted':
      return 'Diajukan';
    case 'approved':
      return 'Disetujui';
    case 'processing':
      return 'Diproses';
    case 'received':
      return 'Diterima';
    case 'cancelled':
      return 'Dibatalkan';
    default:
      return status;
  }
}

export function getPOStatusColor(status: PurchaseOrderStatus): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'draft':
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
    case 'submitted':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' };
    case 'approved':
      return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300' };
    case 'processing':
      return { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-300' };
    case 'received':
      return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' };
    case 'cancelled':
      return { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300' };
  }
}
