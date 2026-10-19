import React, { useState } from 'react';
import {
  Users,
  Shield,
  UserCheck,
  UserX,
  Plus,
  History,
  Activity,
  CheckCircle2,
  X,
  Key,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDateTime, getRoleDescription, getRoleLabel } from '../lib/formatters';
import { User, UserRole } from '../types';

export const UsersView: React.FC = () => {
  const { users, auditLogs, addUser, updateUser, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const [department, setDepartment] = useState('Operasional');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('purchasing');
    setDepartment('Pengadaan Barang');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setDepartment(u.department);
    setStatus(u.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingUser) {
      updateUser(editingUser.id, {
        name,
        email,
        role,
        department,
        status,
      });
    } else {
      addUser({
        name,
        email,
        role,
        department,
        status,
      });
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (u: User) => {
    if (u.id === currentUser?.id) {
      alert('Anda tidak dapat menonaktifkan akun yang sedang aktif digunakan.');
      return;
    }
    const newStatus = u.status === 'active' ? 'inactive' : 'active';
    updateUser(u.id, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs self-start">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'users'
                ? 'bg-white text-[#23374D] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-[#526D82]" />
            <span>Daftar Pengguna ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'audit'
                ? 'bg-white text-[#23374D] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-[#526D82]" />
            <span>Audit Trail & Aktivitas ({auditLogs.length})</span>
          </button>
        </div>

        {isSuperAdmin && activeTab === 'users' && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#23374D] hover:bg-[#1a293a] rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </button>
        )}
      </div>

      {/* USERS LIST TABLE */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">Nama Pengguna</th>
                  <th className="px-4 py-3">Email Sistem</th>
                  <th className="px-4 py-3">Peran Akses (Role)</th>
                  <th className="px-4 py-3">Departemen</th>
                  <th className="px-4 py-3">Terakhir Login</th>
                  <th className="px-4 py-3">Status Akun</th>
                  {isSuperAdmin && <th className="px-4 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#27313B]">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#23374D] text-[#8FA99B] flex items-center justify-center font-bold text-xs shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 block">
                              {u.name} {isCurrent && <span className="text-[#8FA99B] font-mono text-[10px]">(Anda)</span>}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#23374D] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          <Shield className="w-3 h-3 text-[#526D82]" />
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{u.department}</td>
                      <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                        {formatDateTime(u.lastLogin)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          {u.status === 'active' ? 'Aktif' : 'Dinonaktifkan'}
                        </span>
                      </td>
                      {isSuperAdmin && (
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(u)}
                              className="px-2 py-1 text-slate-600 hover:text-[#23374D] hover:bg-slate-100 rounded text-xs font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleStatus(u)}
                              disabled={isCurrent}
                              className={`p-1.5 rounded transition-colors ${
                                u.status === 'active'
                                  ? 'text-rose-600 hover:bg-rose-50'
                                  : 'text-emerald-700 hover:bg-emerald-50'
                              } disabled:opacity-30 disabled:cursor-not-allowed`}
                              title={u.status === 'active' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                            >
                              {u.status === 'active' ? (
                                <UserX className="w-3.5 h-3.5" />
                              ) : (
                                <UserCheck className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUDIT LOG TABLE */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#23374D] uppercase tracking-wider">
                Audit Trail Aktivitas Sistem
              </h3>
              <p className="text-[11px] text-slate-500">
                Mencatat seluruh tindakan operasional, autentikasi, mutasi persediaan, dan persetujuan PO
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500">
              {auditLogs.length} rekaman tersimpan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Waktu & Tanggal</th>
                  <th className="px-4 py-3">Pengguna & Peran</th>
                  <th className="px-4 py-3">Aksi Sistem</th>
                  <th className="px-4 py-3">Modul Target</th>
                  <th className="px-4 py-3">Uraian Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#27313B]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800 block">{log.userName}</span>
                      <span className="text-[10px] text-slate-400 capitalize">{getRoleLabel(log.role)}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] font-bold text-[#23374D]">
                      {log.action}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">
                        {log.targetType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 leading-relaxed max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden text-xs">
            <div className="bg-[#23374D] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#8FA99B]" />
                <h3 className="text-sm font-bold tracking-tight">
                  {editingUser ? 'Perbarui Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Hendra Gunawan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Korporat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@ptsupplier.co.id"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Peran Otorisasi (Role)
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin Operasional</option>
                    <option value="purchasing">Staf Purchasing</option>
                    <option value="gudang">Staf Gudang</option>
                    <option value="manajemen">Manajemen (Read-Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Status Akun
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Departemen / Divisi
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Contoh: Logistik & Pergudangan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
                />
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-500">
                <strong>Izin Akses Role:</strong> {getRoleDescription(role)}
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
                  className="px-4 py-2 font-semibold text-white bg-[#23374D] hover:bg-[#1a293a] rounded-lg shadow-xs"
                >
                  {editingUser ? 'Simpan Akun' : 'Daftarkan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
