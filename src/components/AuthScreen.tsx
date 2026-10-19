import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, ArrowRight, KeyRound, CheckCircle2, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const AuthScreen: React.FC = () => {
  const { login, addToast } = useApp();
  const [email, setEmail] = useState('superadmin@ptsupplier.co.id');
  const [password, setPassword] = useState('••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast('error', 'Silakan masukkan alamat email terdaftar.');
      return;
    }
    login(email, selectedRole);
  };

  const handleDemoSelect = (demoEmail: string, role: UserRole) => {
    setEmail(demoEmail);
    setSelectedRole(role);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setResetSent(true);
    setTimeout(() => {
      addToast('success', `Tautan pemulihan kata sandi telah dikirim ke ${forgotEmail}`, 'Email Terkirim');
      setShowForgotModal(false);
      setResetSent(false);
      setForgotEmail('');
    }, 1200);
  };

  const demoAccounts: { name: string; email: string; role: UserRole; badge: string }[] = [
    { name: 'Ahmad Shofi (Super Admin)', email: 'superadmin@ptsupplier.co.id', role: 'super_admin', badge: 'Full Access' },
    { name: 'Budi Santoso (Admin)', email: 'admin@ptsupplier.co.id', role: 'admin', badge: 'CRUD & Approvals' },
    { name: 'Dewi Anggraini (Purchasing)', email: 'purchasing@ptsupplier.co.id', role: 'purchasing', badge: 'PO & Supplier' },
    { name: 'Hendra Gunawan (Gudang)', email: 'gudang@ptsupplier.co.id', role: 'gudang', badge: 'Stok & Penerimaan' },
    { name: 'Ratna Kusuma (Manajemen)', email: 'manajemen@ptsupplier.co.id', role: 'manajemen', badge: 'Laporan & Audit' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6F4] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        {/* Brand Banner */}
        <div className="bg-[#23374D] p-6 text-white text-center border-b border-[#526D82]/30">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#8FA99B] text-[#23374D] font-black text-xl mb-3 shadow-xs">
            PTS
          </div>
          <h1 className="text-xl font-bold tracking-tight">PT Supplier</h1>
          <p className="text-xs text-slate-300 mt-1">Sistem Informasi Manajemen Supplier & Rantai Pasok</p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat Email Pengguna
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@ptsupplier.co.id"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D] focus:border-[#23374D]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-[#526D82] hover:text-[#23374D] hover:underline"
                >
                  Lupa Sandi?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D] focus:border-[#23374D]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#23374D] hover:bg-[#1a293a] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs mt-2"
            >
              <span>Masuk ke Sistem</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#526D82]" />
              <span>Pilih Cepat Akun Demo (Role Preset)</span>
            </div>
            <div className="space-y-1.5">
              {demoAccounts.map((account) => {
                const isSelected = email === account.email;
                return (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleDemoSelect(account.email, account.role)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'bg-slate-100 border-[#23374D] text-[#23374D] font-medium'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{account.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                      {account.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 p-4 border-t border-slate-200/80 text-center text-xs text-slate-500">
          <p>© 2026 PT Supplier Nusantara Logistik. Terlindungi otorisasi sistem.</p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 border border-slate-200 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-[#23374D]">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-center text-[#23374D]">Pemulihan Kata Sandi</h3>
            <p className="text-xs text-center text-slate-500 mt-1 mb-4 leading-relaxed">
              Masukkan alamat email Anda untuk menerima instruksi penggantian kata sandi melalui Supabase Auth.
            </p>

            <form onSubmit={handleResetSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="nama@ptsupplier.co.id"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#23374D]"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={resetSent}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-[#23374D] hover:bg-[#1a293a] rounded-lg disabled:opacity-50"
                >
                  {resetSent ? 'Mengirim...' : 'Kirim Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
